"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo } from "react";
import { BN } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
// import bs58 from "bs58";

import { getProgram, getLotteryAddress, getMasterAddress, getTicketAddress, getTotalPrize } from "@/lib/utils/program";
import useToast from "@/hooks/useToast";
import { mockWallet } from "@/lib/utils/helper";


interface IAppContext {

}

const AppContext = createContext<IAppContext | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, wallet ?? mockWallet())
    }
  }, [connection, wallet]);

  useEffect(() => {

  }, []);

  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
}