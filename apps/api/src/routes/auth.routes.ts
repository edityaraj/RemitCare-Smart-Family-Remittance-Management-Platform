import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { registerSchema, loginSchema, walletChallengeSchema, walletVerifySchema } from "../schemas/auth.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(ctrl.register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(ctrl.login));
authRouter.post("/logout", requireAuth, asyncHandler(ctrl.logout));
authRouter.get("/me", requireAuth, asyncHandler(ctrl.me));
authRouter.post("/wallet/challenge", requireAuth, validateBody(walletChallengeSchema), asyncHandler(ctrl.walletChallenge));
authRouter.post("/wallet/verify", requireAuth, validateBody(walletVerifySchema), asyncHandler(ctrl.walletVerify));
