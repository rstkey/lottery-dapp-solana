use anchor_lang::{
  prelude::*,
  solana_program::{clock::Clock, hash::hash, program::invoke, system_instruction::transfer},
};

mod constants;
mod error;

use crate::{constants::*, error::*};

declare_id!("5oHayfLkmDnSaynZrxDxbfpBa677VCN2Tiu7AJGqenL6");

#[program]
mod lottery {
  use super::*;

  pub fn init_master(_ctx: Context<InitMaster>) -> Result<()> {
      // Write logic
      Ok(())
  }

  pub fn create_lottery(ctx: Context<CreateLottery>, ticket_price: u64) -> Result<()> {
      //create lottery account
      // what is the lottery acoount ? -> it holds the id, the winning address total prize , if the prize was claimed and who has the authority over lottery
      let lottery = &mut ctx.accounts.lottery;
      let master = &mut ctx.accounts.master;

      // Increment the last ticket id;
      master.last_id += 1;

      // Set Lottery values;
      lottery.id = master.last_id;
      lottery.authority = ctx.accounts.authority.key();
      lottery.ticket_price = ticket_price;

      msg!("Created lottery: {}", lottery.id);
      msg!("Authority: {}", lottery.authority);
      msg!("Ticket Price: {}", lottery.ticket_price);

      Ok(())
  }

  pub fn buy_ticket(ctx: Context<BuyTicket>, lottery_id: u32) -> Result<()> {
      // when we buy a ticket we create a ticket account and pay the lottery with ticket price;
      let lottery = &mut ctx.accounts.lottery;
      let ticket = &mut ctx.accounts.ticket;
      let buyer = &ctx.accounts.buyer;

      if lottery.winner_id.is_some() {
          return err!(LotteryError::WinnerAlreadyExists);
      }

      //Transfer SOl to lottery PDA
      invoke(
          &transfer(&buyer.key(), &lottery.key(), lottery.ticket_price),
          &[
              buyer.to_account_info(),
              lottery.to_account_info(),
              ctx.accounts.system_program.to_account_info(),
          ],
      )?;

      lottery.last_ticket_id += 1;

      ticket.id = lottery.last_ticket_id;
      ticket.lottery_id = lottery_id;
      ticket.authority = buyer.key();

      msg!("Ticket id : {}", ticket.id);
      msg!("Ticket Authority : {}", ticket.authority);

      Ok(())
  }

  pub fn pick_winner(ctx: Context<PickWinner>, _lottery_id: u32) -> Result<()> {
      // this function will choose the winner
      let lottery = &mut ctx.accounts.lottery;

      if lottery.winner_id.is_some() {
          return err!(LotteryError::WinnerAlreadyExists);
      }

      if lottery.last_ticket_id == 0 {
          return err!(LotteryError::NoTickets);
      }

      // pick a psuedo-random winner
      let clock = Clock::get()?;
      let pseudo_random_number = ((u64::from_le_bytes(
          <[u8; 8]>::try_from(&hash(&clock.unix_timestamp.to_be_bytes()).to_bytes()[..8])
              .unwrap(),
      ) * clock.slot)
          % u32::MAX as u64) as u32;

      let winner_id = (pseudo_random_number % lottery.last_ticket_id) + 1;
      lottery.winner_id = Some(winner_id);

      msg!("Winner id: {}", winner_id);
      Ok(())
  }

  pub fn claim_prize(ctx: Context<ClaimPrize>, _lottery_id: u32, _ticket_id: u32) -> Result<()> {
      let lottery = &mut ctx.accounts.lottery;
      let ticket = &ctx.accounts.ticket;
      let winner = &ctx.accounts.authority;

      // validate the winner id
      match lottery.winner_id {
          Some(winner_id) => {
              if winner_id != ticket.id {
                  return err!(LotteryError::InvalidWinner);
              }
          }
          None => return err!(LotteryError::WinnerNotChoosen),
      }

      // Transfer the prize from lottery PDA to the winner
      let prize = lottery
          .ticket_price
          .checked_mul(lottery.last_ticket_id.into())
          .unwrap();

      **lottery.to_account_info().try_borrow_mut_lamports()? -= prize;
      **winner.to_account_info().try_borrow_mut_lamports()? += prize;

      lottery.claimed = true;

      msg!(
          "{} Claimed {} lamports from lottery id {} with ticket id{}",
          winner.key(),
          prize,
          lottery.id,
          ticket.id
      );

      Ok(())
  }
}

#[derive(Accounts)]
pub struct InitMaster<'info> {
  #[account(
      init,
      payer = payer,
      space = 4 + 8,
      seeds = [MASTER_SEED.as_bytes()],
      bump,
  )]
  pub master: Account<'info, Master>,

  #[account(mut)]
  pub payer: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[account]
pub struct Master {
  pub last_id: u32, // 4 space
}

#[derive(Accounts)]
pub struct CreateLottery<'info> {
  #[account(
      init, 
      payer = authority,
      space = 4 + 32 + 8 + 4 + 1 + 4 + 1 + 8,
      seeds = [LOTTERY_SEED.as_bytes(),&(master.last_id + 1).to_le_bytes()],
      bump,
  )]
  pub lottery: Account<'info, Lottery>,

  #[account(
      mut,
      seeds = [MASTER_SEED.as_bytes()],
      bump
  )]
  pub master: Account<'info, Master>,

  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
pub struct Lottery {
  pub id: u32,
  pub authority: Pubkey,
  pub ticket_price: u64,
  pub last_ticket_id: u32,
  pub winner_id: Option<u32>,
  pub claimed: bool,
}

#[derive(Accounts)]
#[instruction(lottery_id: u32)]
pub struct BuyTicket<'info> {
  #[account(
      mut,
      seeds = [LOTTERY_SEED.as_bytes(), &lottery_id.to_le_bytes()],
      bump,
  )]
  pub lottery: Account<'info, Lottery>,
  #[account(
      init,
      payer = buyer,
      space = 8 + 4 + 4 + 32,
      seeds = [
          TICKET_SEED.as_bytes(),
          lottery.key().as_ref(),
          &(lottery.last_ticket_id + 1).to_le_bytes()
      ],
      bump,
  )]
  pub ticket: Account<'info, Ticket>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
pub struct Ticket {
  pub id: u32,
  pub lottery_id: u32,
  pub authority: Pubkey,
}

#[derive(Accounts)]
#[instruction(lottery_id:u32)]
pub struct PickWinner<'info> {
  #[account(
      mut,
      seeds = [LOTTERY_SEED.as_bytes(),&lottery_id.to_le_bytes()],
      bump,
      has_one = authority,
  )]
  pub lottery: Account<'info, Lottery>,

  pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(lottery_id:u32,ticket_id:u32)]
pub struct ClaimPrize<'info> {
  #[account(
      mut,
      seeds = [LOTTERY_SEED.as_bytes(),&lottery_id.to_le_bytes()],
      bump,
  )]
  pub lottery: Account<'info, Lottery>,

  #[account(
      seeds = [
          TICKET_SEED.as_bytes(),
          lottery.key().as_ref(),
          &ticket_id.to_le_bytes(),
      ],
      bump,
      has_one = authority,
  )]
  pub ticket: Account<'info, Ticket>,

  #[account(mut)]
  pub authority: Signer<'info>,

  pub system_program: Program<'info, System>,
}
