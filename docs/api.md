# API Reference

Base path: `/api/v1`. See `apps/api/src/routes/*.routes.ts` for the authoritative source.

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/wallet/challenge`
- `POST /auth/wallet/verify`

## Receivers (sender only)
- `POST /receivers`
- `GET /receivers`
- `PATCH /receivers/:id`
- `DELETE /receivers/:id`

## Plans
- `POST /plans` (sender)
- `GET /plans`
- `GET /plans/:id`
- `POST /plans/:id/funding-record` (sender)
- `PATCH /plans/:id/status` (sender/admin)

## Allocations
- `POST /plans/:planId/allocations` (sender)
- `GET /plans/:planId/allocations`
- `POST /allocations/:id/request` (receiver)
- `POST /allocations/:id/approve-record` (sender)
- `POST /allocations/:id/claim-record` (receiver)
- `POST /allocations/:id/cancel-record` (sender)

## History
- `GET /wallet-interactions`
- `GET /transactions/:txHash`

## Feedback & Admin
- `POST /feedback`
- `GET /admin/stats`
- `GET /admin/users`
- `GET /admin/plans`
- `GET /admin/feedback`

## Health
- `GET /health`
- `GET /health/ready`
