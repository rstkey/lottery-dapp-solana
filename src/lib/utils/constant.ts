import { PublicKey } from "@solana/web3.js";

export const SEEDS = {
  MASTER: "master",
  LOTTERY: "lottery",
  TICKET: "ticket",
} as const;


export const PROGRAM_ID = new PublicKey("5oHayfLkmDnSaynZrxDxbfpBa677VCN2Tiu7AJGqenL6");