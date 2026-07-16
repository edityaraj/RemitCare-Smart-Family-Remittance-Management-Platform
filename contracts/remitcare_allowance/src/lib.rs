#![no_std]

mod errors;
mod storage;
mod test;
mod types;

use errors::ContractError;
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, BytesN, Env};
use types::{Allocation, AllocationStatus, Plan, PlanStatus};

#[contract]
pub struct RemitCareAllowance;

#[contractimpl]
impl RemitCareAllowance {
    /// One-time setup. `admin` is informational only (disputes/analytics) and
    /// is never granted custody of user funds — the contract itself holds them.
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), ContractError> {
        if storage::get_admin(&env).is_some() {
            return Err(ContractError::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::set_token(&env, &token);
        Ok(())
    }

    /// Sender creates an empty plan for a fixed receiver. No funds move yet.
    pub fn create_plan(
        env: Env,
        plan_id: BytesN<32>,
        sender: Address,
        receiver: Address,
    ) -> Result<(), ContractError> {
        sender.require_auth();
        if storage::get_plan(&env, &plan_id).is_some() {
            return Err(ContractError::PlanAlreadyExists);
        }
        let plan = Plan {
            plan_id: plan_id.clone(),
            sender,
            receiver,
            funded_amount: 0,
            allocated_amount: 0,
            released_amount: 0,
            status: PlanStatus::Draft,
        };
        storage::set_plan(&env, &plan);
        env.events().publish((symbol_short!("plan_new"),), plan_id);
        Ok(())
    }

    /// Sender deposits `amount` of the configured token into the contract
    /// for this plan. Requires prior `approve()` on the token by the sender.
    pub fn fund_plan(env: Env, plan_id: BytesN<32>, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let mut plan = storage::get_plan(&env, &plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.sender.require_auth();

        let token_addr = storage::get_token(&env).ok_or(ContractError::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&plan.sender, &env.current_contract_address(), &amount);

        plan.funded_amount += amount;
        plan.status = PlanStatus::Active;
        storage::set_plan(&env, &plan);
        env.events().publish((symbol_short!("plan_fund"),), (plan_id, amount));
        Ok(())
    }

    /// Sender allocates part of the funded balance to a labeled purpose
    /// (education/healthcare/etc — purpose_hash is computed off-chain to
    /// keep the contract free of string handling).
    pub fn create_allocation(
        env: Env,
        plan_id: BytesN<32>,
        allocation_id: BytesN<32>,
        purpose_hash: BytesN<32>,
        amount: i128,
        release_at: u64,
    ) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let mut plan = storage::get_plan(&env, &plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.sender.require_auth();

        if matches!(plan.status, PlanStatus::Completed | PlanStatus::Cancelled) {
            return Err(ContractError::PlanCompleted);
        }
        if storage::get_allocation(&env, &allocation_id).is_some() {
            return Err(ContractError::AllocationAlreadyExists);
        }

        let available = plan.funded_amount - plan.allocated_amount;
        if amount > available {
            return Err(ContractError::ExceedsAvailableBalance);
        }

        plan.allocated_amount += amount;
        storage::set_plan(&env, &plan);

        let allocation = Allocation {
            allocation_id: allocation_id.clone(),
            plan_id,
            purpose_hash,
            amount,
            release_at,
            status: AllocationStatus::Created,
        };
        storage::set_allocation(&env, &allocation);
        env.events()
            .publish((symbol_short!("alloc_new"),), allocation_id);
        Ok(())
    }

    /// Receiver requests release of an allocation they are entitled to.
    pub fn request_release(env: Env, allocation_id: BytesN<32>) -> Result<(), ContractError> {
        let mut allocation =
            storage::get_allocation(&env, &allocation_id).ok_or(ContractError::AllocationNotFound)?;
        let plan = storage::get_plan(&env, &allocation.plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.receiver.require_auth();

        if !matches!(allocation.status, AllocationStatus::Created) {
            return Err(ContractError::InvalidState);
        }
        if allocation.release_at > 0 && env.ledger().timestamp() < allocation.release_at {
            return Err(ContractError::NotYetReleasable);
        }

        allocation.status = AllocationStatus::Requested;
        storage::set_allocation(&env, &allocation);
        env.events()
            .publish((symbol_short!("rel_req"),), allocation_id);
        Ok(())
    }

    /// Sender approves a pending release request.
    pub fn approve_release(env: Env, allocation_id: BytesN<32>) -> Result<(), ContractError> {
        let mut allocation =
            storage::get_allocation(&env, &allocation_id).ok_or(ContractError::AllocationNotFound)?;
        let plan = storage::get_plan(&env, &allocation.plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.sender.require_auth();

        if !matches!(allocation.status, AllocationStatus::Requested) {
            return Err(ContractError::InvalidState);
        }
        allocation.status = AllocationStatus::Approved;
        storage::set_allocation(&env, &allocation);
        env.events()
            .publish((symbol_short!("rel_appr"),), allocation_id);
        Ok(())
    }

    /// Receiver claims an approved allocation; contract pays out the token.
    pub fn claim_allocation(env: Env, allocation_id: BytesN<32>) -> Result<(), ContractError> {
        let mut allocation =
            storage::get_allocation(&env, &allocation_id).ok_or(ContractError::AllocationNotFound)?;
        let mut plan = storage::get_plan(&env, &allocation.plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.receiver.require_auth();

        match allocation.status {
            AllocationStatus::Approved => {}
            AllocationStatus::Claimed => return Err(ContractError::AllocationAlreadyClaimed),
            _ => return Err(ContractError::AllocationNotClaimable),
        }

        let token_addr = storage::get_token(&env).ok_or(ContractError::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(
            &env.current_contract_address(),
            &plan.receiver,
            &allocation.amount,
        );

        allocation.status = AllocationStatus::Claimed;
        storage::set_allocation(&env, &allocation);

        plan.released_amount += allocation.amount;
        if plan.released_amount == plan.funded_amount && plan.allocated_amount == plan.funded_amount {
            plan.status = PlanStatus::Completed;
        }
        storage::set_plan(&env, &plan);

        env.events()
            .publish((symbol_short!("claimed"),), allocation_id);
        Ok(())
    }

    /// Sender cancels an allocation that has not yet been claimed, freeing
    /// its amount back into the plan's available (un-allocated) balance.
    pub fn cancel_allocation(env: Env, allocation_id: BytesN<32>) -> Result<(), ContractError> {
        let mut allocation =
            storage::get_allocation(&env, &allocation_id).ok_or(ContractError::AllocationNotFound)?;
        let mut plan = storage::get_plan(&env, &allocation.plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.sender.require_auth();

        if matches!(allocation.status, AllocationStatus::Claimed) {
            return Err(ContractError::AllocationAlreadyClaimed);
        }
        if matches!(allocation.status, AllocationStatus::Cancelled) {
            return Err(ContractError::AllocationCancelled);
        }

        plan.allocated_amount -= allocation.amount;
        storage::set_plan(&env, &plan);

        allocation.status = AllocationStatus::Cancelled;
        storage::set_allocation(&env, &allocation);
        env.events()
            .publish((symbol_short!("alloc_can"),), allocation_id);
        Ok(())
    }

    /// Sender withdraws whatever funded balance was never allocated (or was
    /// freed by cancellation). Only the un-allocated remainder is refundable.
    pub fn refund_remaining(env: Env, plan_id: BytesN<32>) -> Result<(), ContractError> {
        let mut plan = storage::get_plan(&env, &plan_id).ok_or(ContractError::PlanNotFound)?;
        plan.sender.require_auth();

        let refundable = plan.funded_amount - plan.allocated_amount;
        if refundable <= 0 {
            return Err(ContractError::NothingToRefund);
        }

        let token_addr = storage::get_token(&env).ok_or(ContractError::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &plan.sender, &refundable);

        plan.funded_amount -= refundable;
        storage::set_plan(&env, &plan);

        env.events()
            .publish((symbol_short!("refunded"),), (plan_id, refundable));
        Ok(())
    }

    pub fn get_plan(env: Env, plan_id: BytesN<32>) -> Result<Plan, ContractError> {
        storage::get_plan(&env, &plan_id).ok_or(ContractError::PlanNotFound)
    }

    pub fn get_allocation(env: Env, allocation_id: BytesN<32>) -> Result<Allocation, ContractError> {
        storage::get_allocation(&env, &allocation_id).ok_or(ContractError::AllocationNotFound)
    }
}
