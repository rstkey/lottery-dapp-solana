"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppContext } from "@/context/AppProvider";
import { ellipsify } from "@/lib/utils/helper";

const HistoryTable = () => {
  const { lotteryHistory } = useAppContext()
  return (
    <Table className="mt-10 max-w-[1000px] w-full shadow bg-gray-700 bg-opacity-20 p-4 rounded-sm">
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Lottery</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Ticket</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lotteryHistory.map((history, index) => (
          <TableRow key={index} className="hover:bg-muted/10">
            <TableCell className="text-red-600">#{history.lotteryId}</TableCell>
            <TableCell>{ellipsify(history.winner)}</TableCell>
            <TableCell>{history.winnerId}</TableCell>
            <TableCell className="text-right text-red-600">{history.prize} SOL</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default HistoryTable;