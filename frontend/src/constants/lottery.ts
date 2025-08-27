// 樂透相關常數

// 合約包 ID (需要在部署後更新)
export const LOTTERY_PACKAGE_ID = '0x0'; // TODO: 更新為實際的包 ID

// 彩票狀態
export const LOTTERY_STATES = {
  WAITING: 'WAITING',
  OPEN: 'OPEN', 
  DRAWING: 'DRAWING',
  CLOSED: 'CLOSED'
} as const;

// 查詢鍵
export const LOTTERY_QUERY_KEYS = {
  LOTTERY_INFO: 'lottery-info',
  USER_TICKETS: 'user-tickets',
  LOTTERY_HISTORY: 'lottery-history'
} as const;

export const LOTTERY_CONSTANTS = {
  // 號碼範圍
  MIN_NUMBER: 1,
  MAX_NUMBER: 50,
  NUMBERS_PER_TICKET: 6,
  
  // 購票限制
  MAX_TICKETS_PER_TX: 50,
  
  // 獎金分配比例 (%)
  PRIZE_DISTRIBUTION: {
    TIER1: 65, // 頭獎
    TIER2: 20, // 二獎
    TIER3: 10, // 三獎
    PROTOCOL_FEE: 5
  },
  
  // 中獎條件
  WINNING_CONDITIONS: {
    TIER1: 6, // 6個號碼全中
    TIER2: 5, // 5個號碼中
    TIER3: 4  // 4個號碼中
  },
  
  // 時間相關
  CLAIM_PERIOD_DAYS: 90,
  ROUND_STATUS: {
    OPEN: 'Open',
    CLOSED: 'Closed'
  } as const
};

// 支援的代幣
export const SUPPORTED_TOKENS = {
  SUI: '0x2::sui::SUI',
  USDC: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
  // 根據實際部署添加更多代幣
} as const;

// 網路配置
export const NETWORK_CONFIG = {
  TESTNET: {
    RPC_URL: 'https://fullnode.testnet.sui.io:443',
    EXPLORER_URL: 'https://suiexplorer.com/?network=testnet'
  },
  MAINNET: {
    RPC_URL: 'https://fullnode.mainnet.sui.io:443',
    EXPLORER_URL: 'https://suiexplorer.com/?network=mainnet'
  }
} as const;

// 合約地址 (部署後更新)
export const CONTRACT_ADDRESSES = {
  LOTTERY_PACKAGE: '', // 主合約包地址
  ADMIN_CAP: '',       // 管理員權限對象
  // 其他合約對象地址
} as const;

// UI 相關常數
export const UI_CONSTANTS = {
  NUMBERS_GRID_COLS: 10, // 號碼選擇器每行顯示數量
  MAX_RECENT_ROUNDS: 10, // 最近輪次顯示數量
  REFRESH_INTERVAL: 30000, // 數據刷新間隔 (30秒)
  
  // 動畫時間
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // 顏色主題
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    GRAY: '#6B7280'
  }
} as const;

// 錯誤訊息
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: '請先連接錢包',
  INSUFFICIENT_BALANCE: '餘額不足',
  INVALID_NUMBERS: '請選擇有效的號碼組合',
  DUPLICATE_NUMBERS: '號碼不能重複',
  TOO_MANY_TICKETS: `一次最多只能購買 ${LOTTERY_CONSTANTS.MAX_TICKETS_PER_TX} 張彩券`,
  ROUND_CLOSED: '此輪樂透已結束',
  TRANSACTION_FAILED: '交易失敗，請重試',
  NETWORK_ERROR: '網路錯誤，請檢查連接'
} as const;

// 成功訊息
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '錢包連接成功',
  TICKETS_PURCHASED: '彩券購買成功',
  PRIZES_CLAIMED: '獎金領取成功',
  TRANSACTION_CONFIRMED: '交易已確認'
} as const;
