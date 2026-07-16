import { Router } from "express";
import * as ctrl from "../controllers/misc.controller.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { feedbackSchema } from "../schemas/feedback.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const walletInteractionRouter = Router();
walletInteractionRouter.get("/wallet-interactions", requireAuth, asyncHandler(ctrl.listWalletInteractions));
walletInteractionRouter.get("/transactions/:txHash", requireAuth, asyncHandler(ctrl.getTransaction));

export const feedbackRouter = Router();
feedbackRouter.post("/feedback", requireAuth, validateBody(feedbackSchema), asyncHandler(ctrl.submitFeedback));

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));
adminRouter.get("/stats", asyncHandler(ctrl.adminStats));
adminRouter.get("/users", asyncHandler(ctrl.adminUsers));
adminRouter.get("/plans", asyncHandler(ctrl.adminPlans));
adminRouter.get("/feedback", asyncHandler(ctrl.adminFeedback));

export const healthRouter = Router();
healthRouter.get("/health", ctrl.healthCheck);
healthRouter.get("/health/ready", ctrl.readinessCheck);
