use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    PlanNotFound = 4,
    PlanAlreadyExists = 5,
    PlanNotActive = 6,
    PlanCompleted = 7,
    AllocationNotFound = 8,
    AllocationAlreadyExists = 9,
    AllocationNotClaimable = 10,
    AllocationAlreadyClaimed = 11,
    AllocationCancelled = 12,
    InvalidAmount = 13,
    ExceedsAvailableBalance = 14,
    WrongReceiver = 15,
    WrongSender = 16,
    NotYetReleasable = 17,
    NothingToRefund = 18,
    InvalidState = 19,
}
