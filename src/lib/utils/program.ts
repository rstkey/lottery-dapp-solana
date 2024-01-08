import { AnchorProvider, BN, Idl, Program } from "@project-serum/anchor";

import { PublicKey, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";

import IDL from "./idl.json";

import { PROGRAM_ID, SEEDS } from "./constant";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const getProgram = (connection: Connection, wallet: AnchorWallet): Program<Idl> => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program(IDL as Idl, PROGRAM_ID, provider);
  return program;
}

export const getMasterAddress = async () => {
  return (PublicKey.findProgramAddressSync([Buffer.from(SEEDS.MASTER)], PROGRAM_ID))[0];
}

export const getLotteryAddress = async (id: any): Promise<PublicKey> => {
  return (
    PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LOTTERY), new BN(id).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )
  )[0]
}

export const getTicketAddress = async (lotteryPk: PublicKey, id: any): Promise<PublicKey> => {
  return (
    PublicKey.findProgramAddressSync([
      Buffer.from(SEEDS.TICKET),
      lotteryPk.toBuffer(),
      new BN(id).toArrayLike(Buffer, "le", 4),
    ], PROGRAM_ID)
  )[0];
}

export const getTotalPrize = (lottery: any): string => {
  return new BN(lottery.lastTicketId)
    .mul(lottery.ticketPrice)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
}