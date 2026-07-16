import { Router } from "express";
import * as ctrl from "../controllers/plan.controller.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPlanSchema, fundingRecordSchema, planStatusSchema } from "../schemas/plan.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const planRouter = Router();
planRouter.use(requireAuth);

planRouter.post("/", requireRole("sender"), validateBody(createPlanSchema), asyncHandler(ctrl.createPlan));
planRouter.get("/", asyncHandler(ctrl.listPlans));
planRouter.get("/:id", asyncHandler(ctrl.getPlan));
planRouter.post(
  "/:id/funding-record",
  requireRole("sender"),
  validateBody(fundingRecordSchema),
  asyncHandler(ctrl.recordFunding)
);
planRouter.patch("/:id/status", requireRole("sender", "admin"), validateBody(planStatusSchema), asyncHandler(ctrl.updatePlanStatus));
