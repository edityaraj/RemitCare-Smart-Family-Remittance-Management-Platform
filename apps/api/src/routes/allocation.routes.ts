import { Router } from "express";
import * as ctrl from "../controllers/allocation.controller.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createAllocationSchema, requestReleaseSchema, txRecordSchema } from "../schemas/allocation.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const allocationRouter = Router();
allocationRouter.use(requireAuth);

allocationRouter.post(
  "/plans/:planId/allocations",
  requireRole("sender"),
  validateBody(createAllocationSchema),
  asyncHandler(ctrl.createAllocation)
);
allocationRouter.get("/plans/:planId/allocations", asyncHandler(ctrl.listAllocations));
allocationRouter.post(
  "/allocations/:id/request",
  requireRole("receiver"),
  validateBody(requestReleaseSchema),
  asyncHandler(ctrl.requestRelease)
);
allocationRouter.post(
  "/allocations/:id/approve-record",
  requireRole("sender"),
  validateBody(txRecordSchema),
  asyncHandler(ctrl.approveRelease)
);
allocationRouter.post(
  "/allocations/:id/claim-record",
  requireRole("receiver"),
  validateBody(txRecordSchema),
  asyncHandler(ctrl.claimAllocation)
);
allocationRouter.post("/allocations/:id/cancel-record", requireRole("sender"), asyncHandler(ctrl.cancelAllocation));
