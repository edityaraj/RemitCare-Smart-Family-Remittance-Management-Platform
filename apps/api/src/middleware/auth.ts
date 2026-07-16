import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler.js";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }
  try {
    req.user = verifyAccessToken(header.slice("Bearer ".length));
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: JwtPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    return next();
  };
}
