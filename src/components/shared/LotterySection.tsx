"use client";

import { Button } from "../ui/button";
import { ellipsify } from "@/lib/utils/helper";
import { useAppContext } from "@/context/AppProvider";
import { WalletButton } from "@/solana/provider/solana-provider";

const LotterySection = () => {
  const { isConnected, initMaster, isMasterInitialiazed, createLottery, claimPrize, lotteryHistory, lotteryId, lotteryPot, buyTicket, isLotteryAuthority, isFinished, canClaim, pickWinner } = useAppContext()
  const winnerAddress = lotteryHistory[lotteryHistory.length - 1]?.winner || "111111111111111111111111111111111111";
  return (
    <section className="max-w-[1000px] w-full shadow bg-gray-700 bg-opacity-20 p-4 rounded-sm">
      <h1 className="heading text-center">Lottery <span className="text-red-800">#{lotteryId}</span></h1>

      <div className="flex flex-col items-center mt-5">
        <p className="text-xl font-semibold">Pot : <span className="text-red-800">{lotteryPot} SOL</span></p>

        <div className="flex flex-col items-center">
          <p className="text-xl font-semibold">Recent Winner</p>
          <p className="text-sm font-semibold text-red-600">{ellipsify(winnerAddress)}</p>
        </div>
      </div>

      {
        isConnected ?
          <div className="flex flex-col gap-5 items-center mt-5">
            {!isMasterInitialiazed && <Button className="font-semibold bg-indigo-600 text-xl rounded-lg min-w-[200px] hover:bg-indigo-500 active:scale-95 " onClick={initMaster}>Init Master</Button>}
            {!isFinished && <Button className="font-semibold bg-indigo-600 text-xl rounded-lg min-w-[200px] hover:bg-indigo-500 active:scale-95 " onClick={buyTicket}>Enter</Button>}
            {isLotteryAuthority && !isFinished && <Button className="font-semibold bg-indigo-600 text-xl rounded-lg min-w-[200px] hover:bg-indigo-500 active:scale-95 " onClick={pickWinner}>Pick Winner</Button>}
            {canClaim && <Button className="font-semibold bg-indigo-600 text-xl rounded-lg min-w-[200px] hover:bg-indigo-500 active:scale-95 " onClick={claimPrize}>Claim Prize</Button>}
            {isFinished && <Button className="font-semibold bg-indigo-600 text-xl rounded-lg min-w-[200px] hover:bg-indigo-500 active:scale-95 " onClick={createLottery}>Create Lottery</Button>}
          </div>
          :
          <div className="flex justify-center mt-5">
            <WalletButton />
          </div>
      }

    </section>
  );
}

export default LotterySection;