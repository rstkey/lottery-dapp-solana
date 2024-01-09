import HistoryTable from "@/components/shared/HistoryTable";
import LotterySection from "@/components/shared/LotterySection";
import { Toaster } from "react-hot-toast";

export default function Home() {

  return (
    <main className="flex-1 flex flex-col p-10 items-center">
      <LotterySection />
      <HistoryTable />
      <Toaster />
    </main>
  )
}