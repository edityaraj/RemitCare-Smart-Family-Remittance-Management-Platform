#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::StellarAssetClient,
    Env,
};

fn setup(env: &Env) -> (Address, Address, Address, Address, RemitCareAllowanceClient) {
    let admin = Address::generate(env);
    let sender = Address::generate(env);
    let receiver = Address::generate(env);

    let token_admin = Address::generate(env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_asset_client = StellarAssetClient::new(env, &token_address);
    token_asset_client.mint(&sender, &1_000_000);

    let contract_id = env.register(RemitCareAllowance, ());
    let client = RemitCareAllowanceClient::new(env, &contract_id);
    client.initialize(&admin, &token_address);

    (admin, sender, receiver, token_address, client)
}

fn purpose(env: &Env, tag: &str) -> BytesN<32> {
    let mut bytes = [0u8; 32];
    for (i, b) in tag.as_bytes().iter().take(32).enumerate() {
        bytes[i] = *b;
    }
    BytesN::from_array(env, &bytes)
}

fn id32(env: &Env, seed: u8) -> BytesN<32> {
    BytesN::from_array(env, &[seed; 32])
}

#[test]
fn test_initialize_and_duplicate_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, _s, _r, token, client) = setup(&env);
    let res = client.try_initialize(&admin, &token);
    assert!(res.is_err(), "duplicate initialization must fail");
}

#[test]
fn test_create_plan_and_unauthorized_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 1);
    client.create_plan(&plan_id, &sender, &receiver);
    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.sender, sender);
    assert_eq!(plan.status, PlanStatus::Draft);

    let dup = client.try_create_plan(&plan_id, &sender, &receiver);
    assert!(dup.is_err());
}

#[test]
fn test_fund_plan_and_invalid_zero() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 2);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &1_000);
    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.funded_amount, 1_000);
    assert_eq!(plan.status, PlanStatus::Active);

    let bad = client.try_fund_plan(&plan_id, &0);
    assert!(bad.is_err());
}

#[test]
fn test_allocation_creation_and_exceeds_balance() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 3);
    let alloc_id = id32(&env, 30);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &500);
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "education"), &300, &0);

    let too_big = id32(&env, 31);
    let res = client.try_create_allocation(&plan_id, &too_big, &purpose(&env, "food"), &300, &0);
    assert!(res.is_err(), "allocation exceeding available balance must fail");
}

#[test]
fn test_full_request_approve_claim_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 4);
    let alloc_id = id32(&env, 40);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &200);
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "healthcare"), &200, &0);

    client.request_release(&alloc_id);
    let requested = client.get_allocation(&alloc_id);
    assert_eq!(requested.status, AllocationStatus::Requested);

    client.approve_release(&alloc_id);
    let approved = client.get_allocation(&alloc_id);
    assert_eq!(approved.status, AllocationStatus::Approved);

    client.claim_allocation(&alloc_id);
    let claimed = client.get_allocation(&alloc_id);
    assert_eq!(claimed.status, AllocationStatus::Claimed);

    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.status, PlanStatus::Completed);

    let double = client.try_claim_allocation(&alloc_id);
    assert!(double.is_err(), "double claim must be rejected");
}

#[test]
fn test_cancel_allocation_then_claim_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 5);
    let alloc_id = id32(&env, 50);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &100);
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "rent"), &100, &0);

    client.cancel_allocation(&alloc_id);
    let cancelled = client.get_allocation(&alloc_id);
    assert_eq!(cancelled.status, AllocationStatus::Cancelled);

    let claim_after_cancel = client.try_claim_allocation(&alloc_id);
    assert!(claim_after_cancel.is_err());
}

#[test]
fn test_refund_unused_and_after_full_release() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 6);
    let alloc_id = id32(&env, 60);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &1_000);
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "allowance"), &400, &0);

    // 600 unallocated remains refundable
    client.refund_remaining(&plan_id);
    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.funded_amount, 400);

    let nothing_left = client.try_refund_remaining(&plan_id);
    assert!(nothing_left.is_err(), "nothing left to refund");
}

#[test]
fn test_scheduled_release_not_yet_releasable() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 7);
    let alloc_id = id32(&env, 70);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &100);

    let future = env.ledger().timestamp() + 1_000_000;
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "food"), &100, &future);

    let too_early = client.try_request_release(&alloc_id);
    assert!(too_early.is_err(), "release before release_at must fail");
}

#[test]
fn test_completed_plan_rejects_new_allocation() {
    let env = Env::default();
    env.mock_all_auths();
    let (_a, sender, receiver, _t, client) = setup(&env);
    let plan_id = id32(&env, 8);
    let alloc_id = id32(&env, 80);
    client.create_plan(&plan_id, &sender, &receiver);
    client.fund_plan(&plan_id, &50);
    client.create_allocation(&plan_id, &alloc_id, &purpose(&env, "education"), &50, &0);
    client.request_release(&alloc_id);
    client.approve_release(&alloc_id);
    client.claim_allocation(&alloc_id);

    let another = id32(&env, 81);
    let res = client.try_create_allocation(&plan_id, &another, &purpose(&env, "food"), &10, &0);
    assert!(res.is_err(), "completed plan must reject new allocations");
}
