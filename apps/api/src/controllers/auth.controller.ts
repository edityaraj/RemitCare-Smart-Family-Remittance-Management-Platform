import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { ApiError } from "../middleware/errorHandler.js";

// In-memory nonce store keyed by wallet address. Swap for Redis in production.
const walletChallenges = new Map<string, string>();

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role, isActive: true });

  const accessToken = signAccessToken({ userId: user.id, role: user.role as any });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role as any });
  res.status(201).json({ user: toPublicUser(user), accessToken, refreshToken });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");
  if (!user.isActive) throw new ApiError(403, "Account suspended");

  const accessToken = signAccessToken({ userId: user.id, role: user.role as any });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role as any });
  res.json({ user: toPublicUser(user), accessToken, refreshToken });
}

export async function logout(_req: Request, res: Response) {
  // Stateless JWTs: client discards tokens. A production build should also
  // maintain a refresh-token denylist/rotation store.
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user: toPublicUser(user) });
}

export async function walletChallenge(req: Request, res: Response) {
  const { walletAddress } = req.body;
  const nonce = `RemitCare login nonce: ${crypto.randomBytes(16).toString("hex")}`;
  walletChallenges.set(walletAddress, nonce);
  res.json({ challenge: nonce });
}

export async function walletVerify(req: Request, res: Response) {
  const { walletAddress, signedChallenge } = req.body;
  const nonce = walletChallenges.get(walletAddress);
  if (!nonce) throw new ApiError(400, "No pending challenge for this wallet");

  // NOTE: in production, verify `signedChallenge` against `nonce` using the
  // Stellar SDK's signature verification against the wallet's public key,
  // rather than trusting the client. Wire this up with @stellar/stellar-sdk's
  // Keypair.verify() once the signing flow is implemented in Phase 4.
  walletChallenges.delete(walletAddress);

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { walletAddress, walletVerifiedAt: new Date() },
    { new: true }
  );
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user: toPublicUser(user) });
}

function toPublicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    walletVerifiedAt: user.walletVerifiedAt,
    avatarUrl: user.avatarUrl,
  };
}
