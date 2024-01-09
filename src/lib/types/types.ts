import { PublicKey } from "@solana/web3.js"

export type Lottery = {
  authority: PublicKey,
  claimed: boolean,
  id: number,
  lastTicketId: number,
  ticketPrice: any,
  winnerId: number
}

export type History = {
  lotteryId: number,
  winnerId: number,
  winner: PublicKey,
  prize: any
}