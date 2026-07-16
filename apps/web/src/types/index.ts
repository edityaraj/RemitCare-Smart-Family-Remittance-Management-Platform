export type Role = "sender" | "receiver" | "admin";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  walletAddress?: string;
  walletVerifiedAt?: string;
  avatarUrl?: string;
}

export type PlanStatus = "draft" | "active" | "completed" | "cancelled";
export type AllocationStatus = "created" | "funded" | "requested" | "approved" | "claimed" | "cancelled";
export type Purpose = "education" | "healthcare" | "food" | "rent" | "allowance" | "other";

export interface RemittancePlan {
  _id: string;
  planId: string;
  senderWallet: string;
  receiverWallet: string;
  title: string;
  description?: string;
  totalAmount: string;
  fundedAmount: string;
  releasedAmount: string;
  remainingAmount: string;
  status: PlanStatus;
  createdAt: string;
}

export interface Allocation {
  _id: string;
  allocationId: string;
  planId: string;
  purpose: Purpose;
  title: string;
  amount: string;
  status: AllocationStatus;
  createdAt: string;
}
