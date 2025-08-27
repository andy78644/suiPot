// 樂透相關類型定義

export type LotteryState = 'WAITING' | 'OPEN' | 'DRAWING' | 'CLOSED';

export interface LotteryInfo {
  round: number;
  state: LotteryState;
  ticketPrice: bigint;
  currentPool: bigint;
  drawTime: number;
  winningNumbers: number[] | null;
  totalTickets: number;
  winners: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  prizePool: {
    tier1: bigint;
    tier2: bigint;
    tier3: bigint;
  };
}

export interface LotteryTicket {
  id: string;
  round: number;
  owner: string;
  numbers: number[];
  purchaseTime: number;
  claimed: boolean;
  winningTier?: 1 | 2 | 3;
}

export interface LotteryEvent {
  type: 'DRAW' | 'PRIZE_CLAIMED' | 'ROUND_STARTED';
  round: number;
  timestamp: number;
  data: {
    winningNumbers?: number[];
    prizeAmount?: bigint;
    claimedBy?: string;
    [key: string]: unknown;
  };
}

export interface LotteryRound {
  round_id: string;
  token_type: string;
  ticket_price: number;
  start_time: number;
  end_time: number;
  status: 'Open' | 'Closed';
  total_tickets_sold: number;
  prize_pool: number;
  winning_numbers?: number[];
  prizes?: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
}

export interface Ticket {
  id: string;
  round_id: string;
  owner: string;
  numbers: number[];
  ticket_number: number;
  purchased_at: number;
  claimed: boolean;
  winning_tier?: 1 | 2 | 3;
}

export interface PrizeInfo {
  tier: 1 | 2 | 3;
  matches: number;
  amount: number;
  winners_count: number;
}

export interface UserTickets {
  unclaimed: Ticket[];
  claimed: Ticket[];
  expired: Ticket[];
}

// 錢包相關類型
export interface WalletInfo {
  address: string | null;
  balance: number;
  isConnected: boolean;
}

// 交易相關類型
export interface TransactionResult {
  success: boolean;
  digest?: string;
  error?: string;
}

export interface PurchaseTicketParams {
  round_id: string;
  numbers_sets: number[][];
  total_amount: number;
}

export interface ClaimPrizeParams {
  round_id: string;
  ticket_ids: string[];
}

// 合約事件類型
export interface RoundCreatedEvent {
  round_id: string;
  token: string;
  ticket_price: number;
  start_time: number;
  end_time: number;
}

export interface TicketPurchasedEvent {
  round_id: string;
  buyer: string;
  quantity: number;
}

export interface RoundDrawnEvent {
  round_id: string;
  winning_numbers: number[];
}

export interface PrizeClaimedEvent {
  round_id: string;
  claimer: string;
  tier: number;
  amount: number;
}
