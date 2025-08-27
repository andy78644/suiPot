import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { suiClient } from '@/lib/sui';
import { 
  LOTTERY_PACKAGE_ID, 
  LOTTERY_STATES,
  LOTTERY_QUERY_KEYS 
} from '@/constants/lottery';
import type { 
  LotteryInfo, 
  LotteryTicket, 
  LotteryEvent
} from '@/types/lottery';
import { Transaction } from '@mysten/sui/transactions';

export function useLottery() {
  const { signAndExecute } = useWallet();
  const queryClient = useQueryClient();

  // 查詢彩票資訊
  const lotteryQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO],
    queryFn: async (): Promise<LotteryInfo | null> => {
      try {
        // TODO: 實作查詢彩票狀態的邏輯
        // 這裡需要根據實際的 Sui Move 合約來實作
        const result = await suiClient.getObject({
          id: LOTTERY_PACKAGE_ID, // 這裡應該是彩票對象的 ID
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (!result.data) return null;

        // 解析彩票資訊（需要根據實際合約結構調整）
        const content = result.data.content as {
          fields?: {
            round?: number;
            state?: string;
            ticketPrice?: string;
            currentPool?: string;
            drawTime?: number;
            winningNumbers?: number[];
            totalTickets?: number;
            tier1Winners?: number;
            tier2Winners?: number;
            tier3Winners?: number;
            tier1Pool?: string;
            tier2Pool?: string;
            tier3Pool?: string;
          };
        };
        
        return {
          round: content.fields?.round || 1,
          state: (content.fields?.state as LotteryInfo['state']) || LOTTERY_STATES.WAITING,
          ticketPrice: BigInt(content.fields?.ticketPrice || '1000000000'), // 1 SUI
          currentPool: BigInt(content.fields?.currentPool || '0'),
          drawTime: Number(content.fields?.drawTime || Date.now() + 24 * 60 * 60 * 1000),
          winningNumbers: content.fields?.winningNumbers || null,
          totalTickets: Number(content.fields?.totalTickets || 0),
          winners: {
            tier1: Number(content.fields?.tier1Winners || 0),
            tier2: Number(content.fields?.tier2Winners || 0),
            tier3: Number(content.fields?.tier3Winners || 0),
          },
          prizePool: {
            tier1: BigInt(content.fields?.tier1Pool || '0'),
            tier2: BigInt(content.fields?.tier2Pool || '0'),
            tier3: BigInt(content.fields?.tier3Pool || '0'),
          },
        };
      } catch (error) {
        console.error('Failed to fetch lottery info:', error);
        return null;
      }
    },
    refetchInterval: 30000, // 每 30 秒更新一次
  });

  // 查詢用戶的彩票
  const userTicketsQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS],
    queryFn: async (): Promise<LotteryTicket[]> => {
      try {
        // TODO: 實作查詢用戶彩票的邏輯
        // 這裡需要根據錢包地址查詢用戶擁有的彩票
        return [];
      } catch (error) {
        console.error('Failed to fetch user tickets:', error);
        return [];
      }
    },
    enabled: false, // 只有在有錢包連接時才啟用
  });

  // 查詢歷史開獎記錄
  const historyQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_HISTORY],
    queryFn: async (): Promise<LotteryEvent[]> => {
      try {
        // TODO: 實作查詢歷史記錄的邏輯
        // 查詢過往的開獎事件
        return [];
      } catch (error) {
        console.error('Failed to fetch lottery history:', error);
        return [];
      }
    },
  });

  // 購買彩票
  const buyTicketMutation = useMutation({
    mutationFn: async (numbers: number[]): Promise<string> => {
      const tx = new Transaction();
      
      // TODO: 實作購買彩票的交易邏輯
      // 這裡需要調用合約的購票函數
      tx.moveCall({
        target: `${LOTTERY_PACKAGE_ID}::lottery::buy_ticket`,
        arguments: [
          tx.pure.vector('u8', numbers),
          // 其他必要參數
        ],
      });

      const result = await signAndExecute(tx);
      return result.digest || '';
    },
    onSuccess: () => {
      // 購票成功後刷新相關數據
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS] 
      });
    },
  });

  // 開獎
  const drawMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const tx = new Transaction();
      
      // TODO: 實作開獎的交易邏輯
      tx.moveCall({
        target: `${LOTTERY_PACKAGE_ID}::lottery::draw`,
        arguments: [
          // 必要參數
        ],
      });

      const result = await signAndExecute(tx);
      return result.digest || '';
    },
    onSuccess: () => {
      // 開獎成功後刷新數據
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_HISTORY] 
      });
    },
  });

  // 領取獎金
  const claimPrizeMutation = useMutation({
    mutationFn: async (ticketId: string): Promise<string> => {
      const tx = new Transaction();
      
      // TODO: 實作領取獎金的交易邏輯
      tx.moveCall({
        target: `${LOTTERY_PACKAGE_ID}::lottery::claim_prize`,
        arguments: [
          tx.pure.string(ticketId),
          // 其他必要參數
        ],
      });

      const result = await signAndExecute(tx);
      return result.digest || '';
    },
    onSuccess: () => {
      // 領獎成功後刷新數據
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS] 
      });
    },
  });

  return {
    // 查詢
    lottery: lotteryQuery.data,
    userTickets: userTicketsQuery.data || [],
    history: historyQuery.data || [],
    
    // 加載狀態
    isLoading: lotteryQuery.isLoading || userTicketsQuery.isLoading,
    isHistoryLoading: historyQuery.isLoading,
    
    // 錯誤
    error: lotteryQuery.error || userTicketsQuery.error,
    
    // 變更操作
    buyTicket: buyTicketMutation.mutateAsync,
    draw: drawMutation.mutateAsync,
    claimPrize: claimPrizeMutation.mutateAsync,
    
    // 變更狀態
    isBuying: buyTicketMutation.isPending,
    isDrawing: drawMutation.isPending,
    isClaiming: claimPrizeMutation.isPending,
    
    // 刷新函數
    refetch: () => {
      lotteryQuery.refetch();
      userTicketsQuery.refetch();
      historyQuery.refetch();
    },
  };
}
