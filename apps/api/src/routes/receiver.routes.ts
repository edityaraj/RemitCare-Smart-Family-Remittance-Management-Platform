import { Router } from "express";
import * as ctrl from "../controllers/receiver.controller.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createReceiverSchema, updateReceiverSchema } from "../schemas/receiver.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const receiverRouter = Router();
receiverRouter.use(requireAuth, requireRole("sender"));

receiverRouter.post("/", validateBody(createReceiverSchema), asyncHandler(ctrl.createReceiver));
receiverRouter.get("/", asyncHandler(ctrl.listReceivers));
receiverRouter.patch("/:id", validateBody(updateReceiverSchema), asyncHandler(ctrl.updateReceiver));
receiverRouter.delete("/:id", asyncHandler(ctrl.deleteReceiver));
