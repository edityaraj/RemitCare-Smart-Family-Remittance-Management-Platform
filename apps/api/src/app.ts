import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import { authRouter } from "./routes/auth.routes.js";
import { receiverRouter } from "./routes/receiver.routes.js";
import { planRouter } from "./routes/plan.routes.js";
import { allocationRouter } from "./routes/allocation.routes.js";
import { walletInteractionRouter, feedbackRouter, adminRouter, healthRouter } from "./routes/misc.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req.headers["x-request-id"] as string) ?? randomUUID(),
    })
  );

  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 });
  app.use("/api/v1", apiLimiter);

  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/receivers", receiverRouter);
  app.use("/api/v1/plans", planRouter);
  app.use("/api/v1", allocationRouter); // exposes /plans/:planId/allocations and /allocations/:id/*
  app.use("/api/v1", walletInteractionRouter);
  app.use("/api/v1", feedbackRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
