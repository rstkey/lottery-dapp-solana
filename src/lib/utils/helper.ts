import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

export const mockWallet = () => {
  return {} as AnchorWallet
}

export function ellipsify(pk: unknown, len = 5) {
  const str = String(pk);
  if (str.length > 30) {
    return `${str.slice(0, len)}...${str.slice(-len)}`;
  }
  return str;
}

export const confirmTx = async (txHash: string, connection: Connection) => {
  const blockhashInfo = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: blockhashInfo.blockhash,
    lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
    signature: txHash
  })
}