// 輪次管理工具函數

import { LOTTERY_CONSTANTS } from '@/constants/lottery';

/**
 * 計算當前輪次ID
 * 基於Unix時間戳和固定週期計算
 */
export function getCurrentRoundId(): string {
  const now = Date.now();
  const roundDuration = LOTTERY_CONSTANTS.ROUND_DURATION_DAYS * 24 * 60 * 60 * 1000;
  
  // 使用2024年1月1日作為起始點
  const startEpoch = new Date('2024-01-01').getTime();
  const roundNumber = Math.floor((now - startEpoch) / roundDuration);
  
  return `round_${roundNumber}`;
}

/**
 * 計算指定輪次的時間範圍
 */
export function getRoundTimeRange(roundId: string): {
  startTime: number;
  endTime: number;
  drawTime: number;
  expiresAt: number;
} {
  const roundNumber = parseInt(roundId.replace('round_', ''));
  const roundDuration = LOTTERY_CONSTANTS.ROUND_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const claimPeriod = LOTTERY_CONSTANTS.CLAIM_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  
  const startEpoch = new Date('2024-01-01').getTime();
  const startTime = startEpoch + (roundNumber * roundDuration);
  const endTime = startTime + roundDuration;
  const drawTime = endTime; // 期數結束時立即開獎
  const expiresAt = endTime + claimPeriod; // 結束後90天過期
  
  return {
    startTime,
    endTime,
    drawTime,
    expiresAt
  };
}

/**
 * 獲取下一輪次ID
 */
export function getNextRoundId(): string {
  const currentRoundId = getCurrentRoundId();
  const roundNumber = parseInt(currentRoundId.replace('round_', ''));
  return `round_${roundNumber + 1}`;
}

/**
 * 檢查輪次是否已到期
 */
export function isRoundExpired(endTime: number): boolean {
  return Date.now() > endTime;
}

/**
 * 檢查輪次是否可以開獎
 */
export function canDrawRound(endTime: number): boolean {
  const now = Date.now();
  const drawWindow = LOTTERY_CONSTANTS.DRAW_WINDOW_HOURS * 60 * 60 * 1000;
  
  // 結束時間到達且在開獎窗口內
  return now >= endTime && now <= (endTime + drawWindow);
}

/**
 * 計算距離輪次結束的時間
 */
export function getTimeUntilRoundEnd(endTime: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = Date.now();
  const diff = Math.max(0, endTime - now);
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    total: diff
  };
}

/**
 * 格式化倒數計時顯示
 */
export function formatCountdown(timeLeft: ReturnType<typeof getTimeUntilRoundEnd>): string {
  const { days, hours, minutes, seconds } = timeLeft;
  
  if (days > 0) {
    return `${days}天 ${hours}小時 ${minutes}分鐘`;
  } else if (hours > 0) {
    return `${hours}小時 ${minutes}分鐘 ${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分鐘 ${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 獲取輪次狀態
 */
export function getRoundStatus(startTime: number, endTime: number): 'Open' | 'Closed' | 'Drawing' {
  const now = Date.now();
  const drawWindow = LOTTERY_CONSTANTS.DRAW_WINDOW_HOURS * 60 * 60 * 1000;
  
  if (now < startTime) {
    return 'Closed'; // 尚未開始
  } else if (now >= startTime && now < endTime) {
    return 'Open'; // 進行中
  } else if (now >= endTime && now <= (endTime + drawWindow)) {
    return 'Drawing'; // 開獎中
  } else {
    return 'Closed'; // 已結束
  }
}
