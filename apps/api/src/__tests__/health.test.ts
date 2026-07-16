import { describe, it, expect, vi } from "vitest";

vi.mock("../config/env.js", () => ({
  env: {
    PORT: 4000,
    MONGODB_URI: "mongodb://localhost:27017/test",
    JWT_ACCESS_SECRET: "test_access_secret_1234567890",
    JWT_REFRESH_SECRET: "test_refresh_secret_1234567890",
    CLIENT_URL: "http://localhost:5173",
    STELLAR_RPC_URL: "https://soroban-testnet.stellar.org",
    HORIZON_URL: "https://horizon-testnet.stellar.org",
    CONTRACT_ID: "",
    TOKEN_CONTRACT_ID: "",
    SENTRY_DSN: "",
    NODE_ENV: "test",
  },
}));

import request from "supertest";
import { createApp } from "../app.js";

describe("GET /api/v1/health", () => {
  it("returns ok status", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Auth-protected routes", () => {
  it("rejects requests without a token", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/plans");
    expect(res.status).toBe(401);
  });
});
