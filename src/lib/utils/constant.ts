import { PublicKey } from "@solana/web3.js";

export const SEEDS = {
  MASTER: "master",
  LOTTERY: "lottery",
  TICKET: "ticket",
} as const;


export const PROGRAM_ID = new PublicKey("ECWWMLCvKmp8bXAZ1B5iRotzRwEHdxa9tDjHCnD8XCzP");