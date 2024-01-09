use anchor_lang::prelude::error_code;

#[error_code]
pub enum LotteryError {
    #[msg("Winner already exists.")]
    WinnerAlreadyExists,

    #[msg("Can't choose a winner there are no tickets.")]
    NoTickets,

    #[msg("Winner has not been chosen.")]
    WinnerNotChoosen,

    #[msg("Invalid winner.")]
    InvalidWinner,

    #[msg("The prize has already been claimed.")]
    AlreadyClosed,
}
