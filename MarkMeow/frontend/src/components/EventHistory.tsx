import { useState, useEffect, useCallback } from "react";
import { Contract, formatEther } from "ethers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowDownCircle, ArrowUpCircle, ChevronDown, History } from "lucide-react";

interface EventHistoryProps {
  readContract: Contract | null;
}

interface DonationEvent {
  donor: string;
  amount: string;
  blockNumber: number;
}

interface WithdrawEvent {
  recipient: string;
  amount: string;
  blockNumber: number;
}

const shortenAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

const EventHistory = ({ readContract }: EventHistoryProps) => {
  const [donations, setDonations] = useState<DonationEvent[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!readContract) return;
    setLoading(true);
    try {
      const currentBlock = await readContract.runner?.provider?.getBlockNumber();
      if (!currentBlock) return;
      const fromBlock = Math.max(0, currentBlock - 2000);

      const [allDonationLogs, allWithdrawLogs] = await Promise.all([
        readContract.queryFilter("DonationReceived", fromBlock, "latest"),
        readContract.queryFilter("Withdraw", fromBlock, "latest"),
      ]);

      setDonations(
        allDonationLogs
          .map((log: any) => ({
            donor: log.args?.donor || log.args?.[0] || "",
            amount: formatEther(log.args?.amount || log.args?.[1] || 0),
            blockNumber: log.blockNumber,
          }))
          .reverse()
      );

      setWithdrawals(
        allWithdrawLogs
          .map((log: any) => ({
            recipient: log.args?.recipient || log.args?.[0] || "",
            amount: formatEther(log.args?.amount || log.args?.[1] || 0),
            blockNumber: log.blockNumber,
          }))
          .reverse()
      );
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [readContract]);

  useEffect(() => {
    if (isOpen && donations.length === 0 && withdrawals.length === 0) {
      fetchEvents();
    }
  }, [isOpen, fetchEvents, donations.length, withdrawals.length]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full flex items-center justify-between px-2 py-2 h-auto">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4" /> 链上历史记录
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-2">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchEvents} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading && donations.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">正在从链上加载全部历史记录...</p>
        ) : (
          <Tabs defaultValue="donations" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="donations" className="text-xs">
                <ArrowDownCircle className="w-3 h-3 mr-1" /> 捐款记录
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-xs">
                <ArrowUpCircle className="w-3 h-3 mr-1" /> 奖励记录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="mt-2">
              {donations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">暂无捐款记录</p>
              ) : (
                <div className="max-h-48 overflow-auto rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8 px-2">捐款人</TableHead>
                        <TableHead className="text-xs h-8 px-2 text-right">金额</TableHead>
                        <TableHead className="text-xs h-8 px-2 text-right">区块</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs py-1.5 px-2 font-mono">{shortenAddress(d.donor)}</TableCell>
                          <TableCell className="text-xs py-1.5 px-2 text-right">{d.amount} AVAX</TableCell>
                          <TableCell className="text-xs py-1.5 px-2 text-right text-muted-foreground">#{d.blockNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-2">
              {withdrawals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">暂无奖励记录</p>
              ) : (
                <div className="max-h-48 overflow-auto rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8 px-2">接收人</TableHead>
                        <TableHead className="text-xs h-8 px-2 text-right">金额</TableHead>
                        <TableHead className="text-xs h-8 px-2 text-right">区块</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs py-1.5 px-2 font-mono">{shortenAddress(w.recipient)}</TableCell>
                          <TableCell className="text-xs py-1.5 px-2 text-right">{w.amount} AVAX</TableCell>
                          <TableCell className="text-xs py-1.5 px-2 text-right text-muted-foreground">#{w.blockNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EventHistory;
