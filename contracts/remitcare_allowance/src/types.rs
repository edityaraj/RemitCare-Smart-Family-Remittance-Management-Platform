use soroban_sdk::{contracttype, Address, BytesN};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PlanStatus {
    Draft = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum AllocationStatus {
    Created = 0,
    Requested = 1,
    Approved = 2,
    Claimed = 3,
    Cancelled = 4,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Plan {
    pub plan_id: BytesN<32>,
    pub sender: Address,
    pub receiver: Address,
    pub funded_amount: i128,
    pub allocated_amount: i128,
    pub released_amount: i128,
    pub status: PlanStatus,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Allocation {
    pub allocation_id: BytesN<32>,
    pub plan_id: BytesN<32>,
    pub purpose_hash: BytesN<32>,
    pub amount: i128,
    pub release_at: u64,
    pub status: AllocationStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
    Plan(BytesN<32>),
    Allocation(BytesN<32>),
}
