import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  LOTTERY_STATES,
  LOTTERY_QUERY_KEYS 
} from '@/constants/lottery';
import type { 
  LotteryInfo, 
  LotteryTicket, 
  LotteryEvent
} from '@/types/lottery';

// 模擬數據
const MOCK_LOTTERY_INFO: LotteryInfo = {
  round: 42,
  state: LOTTERY_STATES.OPEN, // 設為 OPEN 以顯示選號介面
  ticketPrice: BigInt('1000000000'), // 1 SUI
  currentPool: BigInt('50000000000'), // 50 SUI 獎池
  drawTime: Date.now() + 2 * 60 * 60 * 1000, // 2小時後開獎
  winningNumbers: null, // 還沒開獎
  totalTickets: 123,
  winners: {
    tier1: 0,
    tier2: 0,
    tier3: 0,
  },
  prizePool: {
    tier1: BigInt('32500000000'), // 65% 給 Tier1
    tier2: BigInt('10000000000'), // 20% 給 Tier2
    tier3: BigInt('5000000000'),  // 10% 給 Tier3
  },
};

const MOCK_USER_TICKETS: LotteryTicket[] = [
  {
    id: 'ticket-1',
    round: 41,
    owner: '0x123...abc',
    numbers: [7, 14, 21, 28, 35, 42],
    purchaseTime: Date.now() - 24 * 60 * 60 * 1000,
    claimed: false,
    winningTier: 3,
  },
  {
    id: 'ticket-2',
    round: 42,
    owner: '0x123...abc',
    numbers: [1, 5, 12, 20, 33, 47],
    purchaseTime: Date.now() - 60 * 60 * 1000,
    claimed: false,
  },
];

const MOCK_HISTORY: LotteryEvent[] = [
  {
    type: 'DRAW',
    round: 41,
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    data: {
      winningNumbers: [3, 9, 18, 27, 36, 45],
    },
  },
  {
    type: 'DRAW',
    round: 40,
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    data: {
      winningNumbers: [2, 11, 23, 31, 39, 44],
    },
  },
];

export function useMockLottery() {
  const queryClient = useQueryClient();
  const [mockState, setMockState] = useState<{
    lottery: LotteryInfo;
    userTickets: LotteryTicket[];
    history: LotteryEvent[];
  }>({
    lottery: MOCK_LOTTERY_INFO,
    userTickets: MOCK_USER_TICKETS,
    history: MOCK_HISTORY,
  });

  // 模擬查詢彩票資訊
  const lotteryQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO],
    queryFn: async (): Promise<LotteryInfo> => {
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockState.lottery;
    },
    refetchInterval: 30000,
  });

  // 模擬查詢用戶彩票
  const userTicketsQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS],
    queryFn: async (): Promise<LotteryTicket[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockState.userTickets;
    },
  });

  // 模擬查詢歷史記錄
  const historyQuery = useQuery({
    queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_HISTORY],
    queryFn: async (): Promise<LotteryEvent[]> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockState.history;
    },
  });

  // 模擬購買彩票
  const buyTicketMutation = useMutation({
    mutationFn: async (numbers: number[]): Promise<string> => {
      // 模擬交易延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 驗證數字
      if (numbers.length !== 6) {
        throw new Error('請選擇 6 個號碼');
      }
      
      if (numbers.some(n => n < 1 || n > 50)) {
        throw new Error('號碼必須在 1-50 之間');
      }
      
      if (new Set(numbers).size !== 6) {
        throw new Error('不能選擇重複的號碼');
      }

      // 模擬成功購票
      const newTicket: LotteryTicket = {
        id: `ticket-${Date.now()}`,
        round: mockState.lottery.round,
        owner: '0x123...abc',
        numbers: [...numbers].sort((a, b) => a - b),
        purchaseTime: Date.now(),
        claimed: false,
      };

      // 更新模擬狀態
      setMockState(prev => ({
        ...prev,
        lottery: {
          ...prev.lottery,
          totalTickets: prev.lottery.totalTickets + 1,
          currentPool: prev.lottery.currentPool + prev.lottery.ticketPrice,
        },
        userTickets: [...prev.userTickets, newTicket],
      }));

      toast.success('購票成功！');
      return 'mock-transaction-hash-' + Date.now();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS] 
      });
    },
  });

  // 模擬開獎
  const drawMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 生成隨機中獎號碼
      const winningNumbers: number[] = [];
      while (winningNumbers.length < 6) {
        const num = Math.floor(Math.random() * 50) + 1;
        if (!winningNumbers.includes(num)) {
          winningNumbers.push(num);
        }
      }
      winningNumbers.sort((a, b) => a - b);

      // 計算中獎情況
      const updatedTickets = mockState.userTickets.map(ticket => {
        if (ticket.round === mockState.lottery.round) {
          const matches = ticket.numbers.filter(n => winningNumbers.includes(n)).length;
          let winningTier: 1 | 2 | 3 | undefined = undefined;
          
          if (matches === 6) {
            winningTier = 1;
          } else if (matches === 5) {
            winningTier = 2;
          } else if (matches === 4) {
            winningTier = 3;
          }
          
          return {
            ...ticket,
            winningTier,
            claimed: false,
          };
        }
        return ticket;
      });

      // 更新彩票狀態
      setMockState(prev => ({
        ...prev,
        lottery: {
          ...prev.lottery,
          state: LOTTERY_STATES.CLOSED,
          winningNumbers,
          winners: {
            tier1: updatedTickets.filter(t => t.winningTier === 1).length,
            tier2: updatedTickets.filter(t => t.winningTier === 2).length,
            tier3: updatedTickets.filter(t => t.winningTier === 3).length,
          },
        },
        userTickets: updatedTickets,
      }));

      toast.success('開獎完成！');
      return 'mock-draw-hash-' + Date.now();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_HISTORY] 
      });
    },
  });

  // 模擬領取獎金
  const claimPrizeMutation = useMutation({
    mutationFn: async (ticketId: string): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ticket = mockState.userTickets.find(t => t.id === ticketId);
      if (!ticket || !ticket.winningTier || ticket.claimed) {
        throw new Error('無效的彩票或已領取');
      }

      // 計算獎金
      let prizeAmount = BigInt('0');
      if (ticket.winningTier === 1) {
        prizeAmount = mockState.lottery.prizePool.tier1;
      } else if (ticket.winningTier === 2) {
        prizeAmount = mockState.lottery.prizePool.tier2 / BigInt('2');
      } else if (ticket.winningTier === 3) {
        prizeAmount = mockState.lottery.prizePool.tier3 / BigInt('5');
      }

      // 更新彩票狀態
      setMockState(prev => ({
        ...prev,
        userTickets: prev.userTickets.map(t => 
          t.id === ticketId 
            ? { ...t, claimed: true }
            : t
        ),
      }));

      toast.success(`成功領取 ${Number(prizeAmount) / 1000000000} SUI 獎金！`);
      return 'mock-claim-hash-' + Date.now();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [LOTTERY_QUERY_KEYS.USER_TICKETS] 
      });
    },
  });

  // 模擬狀態切換（開發用）
  const toggleLotteryState = () => {
    setMockState(prev => ({
      ...prev,
      lottery: {
        ...prev.lottery,
        state: prev.lottery.state === LOTTERY_STATES.OPEN 
          ? LOTTERY_STATES.WAITING 
          : LOTTERY_STATES.OPEN,
      },
    }));
    queryClient.invalidateQueries({ 
      queryKey: [LOTTERY_QUERY_KEYS.LOTTERY_INFO] 
    });
  };

  // 重置到初始狀態
  const resetMockData = () => {
    setMockState({
      lottery: { ...MOCK_LOTTERY_INFO },
      userTickets: [...MOCK_USER_TICKETS],
      history: [...MOCK_HISTORY],
    });
    queryClient.invalidateQueries();
    toast.success('模擬數據已重置');
  };

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

    // 開發用工具
    toggleLotteryState,
    resetMockData,
  };
}
