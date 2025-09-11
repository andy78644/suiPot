import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
// import { suiClient } from '@/lib/sui';
import { 
  // LOTTERY_PACKAGE_ID, 
  // LOTTERY_STATES,
  LOTTERY_QUERY_KEYS 
} from '@/constants/lottery';
import { 
  getCurrentRoundId, 
  getNextRoundId, 
  getRoundTimeRange, 
  getTimeUntilRoundEnd,
  getRoundStatus 
} from '@/lib/roundManager';
import type { 
  LotteryTicket, 
  LotteryRound
} from '@/types/lottery';
import { Transaction } from '@mysten/sui/transactions';

export function useLottery() {
  const { signAndExecute } = useWallet();
  const queryClient = useQueryClient();

  // 獲取當前輪次資訊
  const currentRoundQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO, 'current'],
    queryFn: async (): Promise<LotteryRound | null> => {
      try {
        const currentRoundId = getCurrentRoundId();
        const timeRange = getRoundTimeRange(currentRoundId);
        const status = getRoundStatus(timeRange.startTime, timeRange.endTime);
        
        // TODO: 從合約獲取實際數據
        // 這裡返回計算出的輪次資訊作為基礎
        return {
          round_id: currentRoundId,
          token_type: 'SUI',
          ticket_price: 1, // 1 SUI
          start_time: timeRange.startTime,
          end_time: timeRange.endTime,
          draw_time: timeRange.drawTime,
          status: status,
          total_tickets_sold: 0,
          prize_pool: 0,
          is_current: true,
          expires_at: timeRange.expiresAt
        };
      } catch (error) {
        console.error('Error fetching current round:', error);
        return null;
      }
    },
    refetchInterval: 30000, // 每30秒刷新
  });

  // 獲取下一輪次資訊
  const nextRoundQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO, 'next'],
    queryFn: async (): Promise<LotteryRound | null> => {
      try {
        const nextRoundId = getNextRoundId();
        const timeRange = getRoundTimeRange(nextRoundId);
        const status = getRoundStatus(timeRange.startTime, timeRange.endTime);
        
        return {
          round_id: nextRoundId,
          token_type: 'SUI',
          ticket_price: 1,
          start_time: timeRange.startTime,
          end_time: timeRange.endTime,
          draw_time: timeRange.drawTime,
          status: status,
          total_tickets_sold: 0,
          prize_pool: 0,
          is_current: false,
          expires_at: timeRange.expiresAt
        };
      } catch (error) {
        console.error('Error fetching next round:', error);
        return null;
      }
    },
    refetchInterval: 30000,
  });

  // 計算當前輪次倒數計時
  const useCountdown = (endTime: number) => {
    const countdownQuery = useQuery({
      queryKey: ['countdown', endTime],
      queryFn: () => getTimeUntilRoundEnd(endTime),
      refetchInterval: 1000, // 每秒更新
      enabled: !!endTime,
    });
    
    return countdownQuery;
  };

  // 查詢使用者的彩券
  const userTicketsQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS],
    queryFn: async (): Promise<LotteryTicket[]> => {
      try {
        // TODO: 實作查詢使用者彩券邏輯
        return [];
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // 購買彩券
  const purchaseTicketsMutation = useMutation({
    mutationFn: async ({ 
      // roundId, 
      // numberSets 
    }: { 
      roundId: string; 
      numberSets: number[][];
    }) => {
      const tx = new Transaction();
      
      // TODO: 添加購買彩券的交易邏輯
      // tx.moveCall({
      //   target: `${LOTTERY_PACKAGE_ID}::lottery::purchase_tickets`,
      //   arguments: [
      //     tx.pure(roundId),
      //     tx.pure(numberSets),
      //   ]
      // });

      const result = await signAndExecute(tx);
      return result;
    },
    onSuccess: () => {
      // 重新獲取相關數據
      queryClient.invalidateQueries({
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO]
      });
      queryClient.invalidateQueries({
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS]
      });
    },
  });

  // 領取獎金
  const claimPrizeMutation = useMutation({
    mutationFn: async ({ 
      // ticketIds 
    }: { 
      ticketIds: string[];
    }) => {
      const tx = new Transaction();
      
      // TODO: 添加領取獎金的交易邏輯
      // tx.moveCall({
      //   target: `${LOTTERY_PACKAGE_ID}::lottery::claim_prizes`,
      //   arguments: [
      //     tx.pure(ticketIds),
      //   ]
      // });

      const result = await signAndExecute(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS]
      });
    },
  });

  return {
    // 輪次資訊
    currentRound: currentRoundQuery.data,
    nextRound: nextRoundQuery.data,
    isLoadingRounds: currentRoundQuery.isLoading || nextRoundQuery.isLoading,
    
    // 倒數計時
    useCountdown,
    
    // 使用者彩券
    userTickets: userTicketsQuery.data ?? [],
    isLoadingTickets: userTicketsQuery.isLoading,
    
    // 操作
    purchaseTickets: purchaseTicketsMutation.mutate,
    isPurchasing: purchaseTicketsMutation.isPending,
    
    claimPrize: claimPrizeMutation.mutate,
    isClaiming: claimPrizeMutation.isPending,
    
    // 刷新數據
    refetch: () => {
      currentRoundQuery.refetch();
      nextRoundQuery.refetch();
      userTicketsQuery.refetch();
    },
  };
}
