"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { BN } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import { getProgram, getLotteryAddress, getMasterAddress, getTicketAddress, getTotalPrize } from "@/lib/utils/program";
import { confirmTx, mockWallet } from "@/lib/utils/helper";
import { handleError } from "@/lib/utils/error";
import { History, Lottery } from "@/lib/types/types";
import showToast from "@/hooks/useToast";

interface IAppContext {
  lotteryId: number;
  canClaim: boolean;
  lotteryPot: number;
  isConnected: boolean;
  isFinished: boolean;
  lotteryHistory: History[];
  isLotteryAuthority: boolean;
  isMasterInitialiazed: boolean;
  getPot: () => void;
  claimPrize: () => Promise<void>;
  buyTicket: () => Promise<void>;
  pickWinner: () => Promise<void>;
  initMaster: () => Promise<void>;
  createLottery: () => Promise<void>;
}

const AppContext = createContext<IAppContext | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const toast = showToast();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [initialized, setInitialized] = useState(false);
  const [lotteryId, setLotteryId] = useState<number>(0);
  const [lotteryPot, setLotteryPot] = useState<number>(0);
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [userWinningId, setUserWinningId] = useState<number | null>(null);
  const [masterAddress, setMasterAddress] = useState<PublicKey | null>(null);
  const [lotteryAddress, setLotteryAddress] = useState<PublicKey | null>(null);
  const [lotteryHistory, setLotteryHistory] = useState<History[]>([]);
  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, wallet ?? mockWallet())
    }
  }, [connection, wallet]);

  const updateState = async () => {
    if (!program) return;
    try {
      const masterAddr = masterAddress ?? (await getMasterAddress());
      const master = await program.account.master.fetch(masterAddr);
      const lotteryAddress = await getLotteryAddress(master.lastId);
      const lottery = await program.account.lottery.fetch(lotteryAddress) as Lottery;

      setLottery(lottery);
      setInitialized(true);
      setLotteryId(master.lastId);
      setMasterAddress(masterAddr);
      setLotteryAddress(lotteryAddress);

      if (!wallet?.publicKey) return;
      const userTickets = await program.account.ticket.all();

      /*
     [
        {
          memcmp: {
            bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)),
            offset: 12,
          },
        },
        { memcmp: { bytes: wallet.publicKey.toBase58(), offset: 16 } },
      ]
      */

      // check whether any of the user tickets win
      const userWin = userTickets.some(tic => tic.account.id == lottery.winnerId);
      console.log('userTickets: ', userTickets);
      console.log('userWin: ', userWin);
      if (userWin) {
        setUserWinningId(lottery.winnerId);
      } else {
        setUserWinningId(null);
      }

    } catch (error) {
      console.log('error: ', error);
    }
  }

  // call solana program instruction here
  async function initMaster() {
    if (!program) return;
    try {
      const txHash = await program.methods
        .initMaster()
        .accounts({
          master: masterAddress ?? (await getMasterAddress()),
          payer: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);
      toast("Initialized Master", "success");
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async function createLottery() {
    if (!program) return;
    try {
      const lotteryAddress = await getLotteryAddress(lotteryId + 1); // PublicKey
      const txHash = await program.methods
        .createLottery(new BN(1).mul(new BN(LAMPORTS_PER_SOL)))
        .accounts({
          lottery: lotteryAddress,
          master: masterAddress ?? (await getMasterAddress()),
          authority: wallet?.publicKey,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      await confirmTx(txHash, connection);
      updateState()
      getPot()
      toast("Lottery Created!", "success");
    } catch (error) {
      handleError(error);
    }
  }

  function getPot() {
    const pot = getTotalPrize(lottery);
    console.log('pot: ', pot);
    setLotteryPot(Number(pot));
  }

  async function buyTicket() {
    if (!program || !lotteryAddress) return;
    try {
      const txHash = await program.methods
        .buyTicket(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, (lottery?.lastTicketId ?? 0) + 1),
          buyer: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState()
      toast("Bought a Ticket!", "success");
    } catch (error) {
      handleError(error);
    }
  }

  async function pickWinner() {
    if (!program || !lotteryAddress) return;
    try {
      const txHash = await program.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: wallet?.publicKey,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState()
      toast("Picked a Winner!", "success");
    } catch (error) {
      handleError(error);
    }
  }

  async function getHistory() {
    if (!lotteryId || !program) return;
    const history: History[] = [];

    for (const i in new Array(lotteryId).fill(null)) {
      const id = lotteryId - parseInt(i);
      if (!id) break;

      const lotteryAddress = await getLotteryAddress(id);
      const lottery = await program.account.lottery.fetch(lotteryAddress) as Lottery;
      const winnerId = lottery.winnerId;
      if (!winnerId) continue;

      const ticketAddress = await getTicketAddress(lotteryAddress, winnerId);
      const ticket = await program.account.ticket.fetch(ticketAddress);

      history.push({
        lotteryId: id,
        winnerId,
        winner: ticket.authority,
        prize: getTotalPrize(lottery),
      });
    }

    setLotteryHistory(history);
  }

  async function claimPrize() {
    if (!program || !lotteryAddress) return;
    try {
      const txHash = await program.methods
        .claimPrize(lotteryId, userWinningId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, userWinningId),
          authority: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await confirmTx(txHash, connection);

      updateState();
      toast("Claimed Prize!", "success");
    } catch (error) {
      handleError(error);
    }
  }

  useEffect(() => {
    updateState()
  }, [program]);

  useEffect(() => {
    if (!lottery) return;
    getPot();
    getHistory();
  }, [lottery]);

  const isFinished = !!(lottery && lottery.winnerId != null);
  const canClaim = !!(lottery && !lottery.claimed && userWinningId);
  const isLotteryAuthority = !!(wallet && lottery && wallet?.publicKey?.equals(lottery?.authority ?? null));

  return (
    <AppContext.Provider value={{
      isConnected: !!wallet?.publicKey, isMasterInitialiazed: initialized,
      lotteryId, lotteryPot, isLotteryAuthority, isFinished, canClaim, lotteryHistory,
      initMaster, createLottery, getPot, buyTicket, pickWinner, claimPrize
    }}
    >
      {children}
    </AppContext.Provider >
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