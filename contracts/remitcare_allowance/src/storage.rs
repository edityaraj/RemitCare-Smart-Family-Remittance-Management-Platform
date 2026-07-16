use soroban_sdk::{Address, BytesN, Env};

use crate::types::{Allocation, DataKey, Plan};

pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_token(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Token)
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_plan(env: &Env, plan_id: &BytesN<32>) -> Option<Plan> {
    env.storage().persistent().get(&DataKey::Plan(plan_id.clone()))
}

pub fn set_plan(env: &Env, plan: &Plan) {
    env.storage()
        .persistent()
        .set(&DataKey::Plan(plan.plan_id.clone()), plan);
}

pub fn get_allocation(env: &Env, allocation_id: &BytesN<32>) -> Option<Allocation> {
    env.storage()
        .persistent()
        .get(&DataKey::Allocation(allocation_id.clone()))
}

pub fn set_allocation(env: &Env, allocation: &Allocation) {
    env.storage().persistent().set(
        &DataKey::Allocation(allocation.allocation_id.clone()),
        allocation,
    );
}
