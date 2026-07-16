import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDAPWBOKK5BUOIQB3NH5RHEOGBP3OQ66YCDNYGD7Q3EO3XBESX7HS7NH",
  }
} as const


export interface Plan {
  allocated_amount: i128;
  funded_amount: i128;
  plan_id: Buffer;
  receiver: string;
  released_amount: i128;
  sender: string;
  status: PlanStatus;
}

export type DataKey = {tag: "Admin", values: void} | {tag: "Token", values: void} | {tag: "Plan", values: readonly [Buffer]} | {tag: "Allocation", values: readonly [Buffer]};


export interface Allocation {
  allocation_id: Buffer;
  amount: i128;
  plan_id: Buffer;
  purpose_hash: Buffer;
  release_at: u64;
  status: AllocationStatus;
}

export enum PlanStatus {
  Draft = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum AllocationStatus {
  Created = 0,
  Requested = 1,
  Approved = 2,
  Claimed = 3,
  Cancelled = 4,
}

export const ContractError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotAuthorized"},
  4: {message:"PlanNotFound"},
  5: {message:"PlanAlreadyExists"},
  6: {message:"PlanNotActive"},
  7: {message:"PlanCompleted"},
  8: {message:"AllocationNotFound"},
  9: {message:"AllocationAlreadyExists"},
  10: {message:"AllocationNotClaimable"},
  11: {message:"AllocationAlreadyClaimed"},
  12: {message:"AllocationCancelled"},
  13: {message:"InvalidAmount"},
  14: {message:"ExceedsAvailableBalance"},
  15: {message:"WrongReceiver"},
  16: {message:"WrongSender"},
  17: {message:"NotYetReleasable"},
  18: {message:"NothingToRefund"},
  19: {message:"InvalidState"}
}

export interface Client {
  /**
   * Construct and simulate a get_plan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_plan: ({plan_id}: {plan_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Plan>>>

  /**
   * Construct and simulate a fund_plan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender deposits `amount` of the configured token into the contract
   * for this plan. Requires prior `approve()` on the token by the sender.
   */
  fund_plan: ({plan_id, amount}: {plan_id: Buffer, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time setup. `admin` is informational only (disputes/analytics) and
   * is never granted custody of user funds — the contract itself holds them.
   */
  initialize: ({admin, token}: {admin: string, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_plan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender creates an empty plan for a fixed receiver. No funds move yet.
   */
  create_plan: ({plan_id, sender, receiver}: {plan_id: Buffer, sender: string, receiver: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_allocation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_allocation: ({allocation_id}: {allocation_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Allocation>>>

  /**
   * Construct and simulate a approve_release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender approves a pending release request.
   */
  approve_release: ({allocation_id}: {allocation_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a request_release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Receiver requests release of an allocation they are entitled to.
   */
  request_release: ({allocation_id}: {allocation_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a claim_allocation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Receiver claims an approved allocation; contract pays out the token.
   */
  claim_allocation: ({allocation_id}: {allocation_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a refund_remaining transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender withdraws whatever funded balance was never allocated (or was
   * freed by cancellation). Only the un-allocated remainder is refundable.
   */
  refund_remaining: ({plan_id}: {plan_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a cancel_allocation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender cancels an allocation that has not yet been claimed, freeing
   * its amount back into the plan's available (un-allocated) balance.
   */
  cancel_allocation: ({allocation_id}: {allocation_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_allocation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sender allocates part of the funded balance to a labeled purpose
   * (education/healthcare/etc — purpose_hash is computed off-chain to
   * keep the contract free of string handling).
   */
  create_allocation: ({plan_id, allocation_id, purpose_hash, amount, release_at}: {plan_id: Buffer, allocation_id: Buffer, purpose_hash: Buffer, amount: i128, release_at: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAIZ2V0X3BsYW4AAAABAAAAAAAAAAdwbGFuX2lkAAAAA+4AAAAgAAAAAQAAA+kAAAfQAAAABFBsYW4AAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAIhTZW5kZXIgZGVwb3NpdHMgYGFtb3VudGAgb2YgdGhlIGNvbmZpZ3VyZWQgdG9rZW4gaW50byB0aGUgY29udHJhY3QKZm9yIHRoaXMgcGxhbi4gUmVxdWlyZXMgcHJpb3IgYGFwcHJvdmUoKWAgb24gdGhlIHRva2VuIGJ5IHRoZSBzZW5kZXIuAAAACWZ1bmRfcGxhbgAAAAAAAAIAAAAAAAAAB3BsYW5faWQAAAAD7gAAACAAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAJFPbmUtdGltZSBzZXR1cC4gYGFkbWluYCBpcyBpbmZvcm1hdGlvbmFsIG9ubHkgKGRpc3B1dGVzL2FuYWx5dGljcykgYW5kCmlzIG5ldmVyIGdyYW50ZWQgY3VzdG9keSBvZiB1c2VyIGZ1bmRzIOKAlCB0aGUgY29udHJhY3QgaXRzZWxmIGhvbGRzIHRoZW0uAAAAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAEVTZW5kZXIgY3JlYXRlcyBhbiBlbXB0eSBwbGFuIGZvciBhIGZpeGVkIHJlY2VpdmVyLiBObyBmdW5kcyBtb3ZlIHlldC4AAAAAAAALY3JlYXRlX3BsYW4AAAAAAwAAAAAAAAAHcGxhbl9pZAAAAAPuAAAAIAAAAAAAAAAGc2VuZGVyAAAAAAATAAAAAAAAAAhyZWNlaXZlcgAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAOZ2V0X2FsbG9jYXRpb24AAAAAAAEAAAAAAAAADWFsbG9jYXRpb25faWQAAAAAAAPuAAAAIAAAAAEAAAPpAAAH0AAAAApBbGxvY2F0aW9uAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAACpTZW5kZXIgYXBwcm92ZXMgYSBwZW5kaW5nIHJlbGVhc2UgcmVxdWVzdC4AAAAAAA9hcHByb3ZlX3JlbGVhc2UAAAAAAQAAAAAAAAANYWxsb2NhdGlvbl9pZAAAAAAAA+4AAAAgAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAEBSZWNlaXZlciByZXF1ZXN0cyByZWxlYXNlIG9mIGFuIGFsbG9jYXRpb24gdGhleSBhcmUgZW50aXRsZWQgdG8uAAAAD3JlcXVlc3RfcmVsZWFzZQAAAAABAAAAAAAAAA1hbGxvY2F0aW9uX2lkAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAERSZWNlaXZlciBjbGFpbXMgYW4gYXBwcm92ZWQgYWxsb2NhdGlvbjsgY29udHJhY3QgcGF5cyBvdXQgdGhlIHRva2VuLgAAABBjbGFpbV9hbGxvY2F0aW9uAAAAAQAAAAAAAAANYWxsb2NhdGlvbl9pZAAAAAAAA+4AAAAgAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAItTZW5kZXIgd2l0aGRyYXdzIHdoYXRldmVyIGZ1bmRlZCBiYWxhbmNlIHdhcyBuZXZlciBhbGxvY2F0ZWQgKG9yIHdhcwpmcmVlZCBieSBjYW5jZWxsYXRpb24pLiBPbmx5IHRoZSB1bi1hbGxvY2F0ZWQgcmVtYWluZGVyIGlzIHJlZnVuZGFibGUuAAAAABByZWZ1bmRfcmVtYWluaW5nAAAAAQAAAAAAAAAHcGxhbl9pZAAAAAPuAAAAIAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAIVTZW5kZXIgY2FuY2VscyBhbiBhbGxvY2F0aW9uIHRoYXQgaGFzIG5vdCB5ZXQgYmVlbiBjbGFpbWVkLCBmcmVlaW5nCml0cyBhbW91bnQgYmFjayBpbnRvIHRoZSBwbGFuJ3MgYXZhaWxhYmxlICh1bi1hbGxvY2F0ZWQpIGJhbGFuY2UuAAAAAAAAEWNhbmNlbF9hbGxvY2F0aW9uAAAAAAAAAQAAAAAAAAANYWxsb2NhdGlvbl9pZAAAAAAAA+4AAAAgAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAALBTZW5kZXIgYWxsb2NhdGVzIHBhcnQgb2YgdGhlIGZ1bmRlZCBiYWxhbmNlIHRvIGEgbGFiZWxlZCBwdXJwb3NlCihlZHVjYXRpb24vaGVhbHRoY2FyZS9ldGMg4oCUIHB1cnBvc2VfaGFzaCBpcyBjb21wdXRlZCBvZmYtY2hhaW4gdG8Ka2VlcCB0aGUgY29udHJhY3QgZnJlZSBvZiBzdHJpbmcgaGFuZGxpbmcpLgAAABFjcmVhdGVfYWxsb2NhdGlvbgAAAAAAAAUAAAAAAAAAB3BsYW5faWQAAAAD7gAAACAAAAAAAAAADWFsbG9jYXRpb25faWQAAAAAAAPuAAAAIAAAAAAAAAAMcHVycG9zZV9oYXNoAAAD7gAAACAAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAKcmVsZWFzZV9hdAAAAAAABgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAQAAAAAAAAAAAAAABFBsYW4AAAAHAAAAAAAAABBhbGxvY2F0ZWRfYW1vdW50AAAACwAAAAAAAAANZnVuZGVkX2Ftb3VudAAAAAAAAAsAAAAAAAAAB3BsYW5faWQAAAAD7gAAACAAAAAAAAAACHJlY2VpdmVyAAAAEwAAAAAAAAAPcmVsZWFzZWRfYW1vdW50AAAAAAsAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAClBsYW5TdGF0dXMAAA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVG9rZW4AAAAAAAABAAAAAAAAAARQbGFuAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAKQWxsb2NhdGlvbgAAAAAAAQAAA+4AAAAg",
        "AAAAAQAAAAAAAAAAAAAACkFsbG9jYXRpb24AAAAAAAYAAAAAAAAADWFsbG9jYXRpb25faWQAAAAAAAPuAAAAIAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAdwbGFuX2lkAAAAA+4AAAAgAAAAAAAAAAxwdXJwb3NlX2hhc2gAAAPuAAAAIAAAAAAAAAAKcmVsZWFzZV9hdAAAAAAABgAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEEFsbG9jYXRpb25TdGF0dXM=",
        "AAAAAwAAAAAAAAAAAAAAClBsYW5TdGF0dXMAAAAAAAQAAAAAAAAABURyYWZ0AAAAAAAAAAAAAAAAAAAGQWN0aXZlAAAAAAABAAAAAAAAAAlDb21wbGV0ZWQAAAAAAAACAAAAAAAAAAlDYW5jZWxsZWQAAAAAAAAD",
        "AAAAAwAAAAAAAAAAAAAAEEFsbG9jYXRpb25TdGF0dXMAAAAFAAAAAAAAAAdDcmVhdGVkAAAAAAAAAAAAAAAACVJlcXVlc3RlZAAAAAAAAAEAAAAAAAAACEFwcHJvdmVkAAAAAgAAAAAAAAAHQ2xhaW1lZAAAAAADAAAAAAAAAAlDYW5jZWxsZWQAAAAAAAAE",
        "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAATAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAACAAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAAAAwAAAAAAAAAMUGxhbk5vdEZvdW5kAAAABAAAAAAAAAARUGxhbkFscmVhZHlFeGlzdHMAAAAAAAAFAAAAAAAAAA1QbGFuTm90QWN0aXZlAAAAAAAABgAAAAAAAAANUGxhbkNvbXBsZXRlZAAAAAAAAAcAAAAAAAAAEkFsbG9jYXRpb25Ob3RGb3VuZAAAAAAACAAAAAAAAAAXQWxsb2NhdGlvbkFscmVhZHlFeGlzdHMAAAAACQAAAAAAAAAWQWxsb2NhdGlvbk5vdENsYWltYWJsZQAAAAAACgAAAAAAAAAYQWxsb2NhdGlvbkFscmVhZHlDbGFpbWVkAAAACwAAAAAAAAATQWxsb2NhdGlvbkNhbmNlbGxlZAAAAAAMAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAADQAAAAAAAAAXRXhjZWVkc0F2YWlsYWJsZUJhbGFuY2UAAAAADgAAAAAAAAANV3JvbmdSZWNlaXZlcgAAAAAAAA8AAAAAAAAAC1dyb25nU2VuZGVyAAAAABAAAAAAAAAAEE5vdFlldFJlbGVhc2FibGUAAAARAAAAAAAAAA9Ob3RoaW5nVG9SZWZ1bmQAAAAAEgAAAAAAAAAMSW52YWxpZFN0YXRlAAAAEw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_plan: this.txFromJSON<Result<Plan>>,
        fund_plan: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        create_plan: this.txFromJSON<Result<void>>,
        get_allocation: this.txFromJSON<Result<Allocation>>,
        approve_release: this.txFromJSON<Result<void>>,
        request_release: this.txFromJSON<Result<void>>,
        claim_allocation: this.txFromJSON<Result<void>>,
        refund_remaining: this.txFromJSON<Result<void>>,
        cancel_allocation: this.txFromJSON<Result<void>>,
        create_allocation: this.txFromJSON<Result<void>>
  }
}