import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 用於合併 Tailwind CSS 類名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化數字為千位分隔符
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// 格式化倒數計時
export function formatCountdown(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}天 ${hours}時 ${minutes}分`;
  } else if (hours > 0) {
    return `${hours}時 ${minutes}分 ${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分 ${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

// 驗證號碼組合
export function validateNumbers(numbers: number[]): {
  isValid: boolean;
  error?: string;
} {
  // 檢查數量
  if (numbers.length !== 6) {
    return { isValid: false, error: '請選擇 6 個號碼' };
  }

  // 檢查範圍
  const invalidNumbers = numbers.filter(num => num < 1 || num > 50);
  if (invalidNumbers.length > 0) {
    return { isValid: false, error: '號碼必須在 1-50 之間' };
  }

  // 檢查重複
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    return { isValid: false, error: '號碼不能重複' };
  }

  return { isValid: true };
}

// 生成隨機號碼
export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 6) {
    const num = Math.floor(Math.random() * 50) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// 計算匹配的號碼數量
export function calculateMatches(userNumbers: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers);
  return userNumbers.filter(num => winningSet.has(num)).length;
}

// 獲取中獎等級
export function getWinningTier(matches: number): 1 | 2 | 3 | null {
  switch (matches) {
    case 6:
      return 1; // 頭獎
    case 5:
      return 2; // 二獎
    case 4:
      return 3; // 三獎
    default:
      return null; // 未中獎
  }
}

// 格式化時間戳
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-TW');
}

// 複製到剪貼板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// 延遲函數
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
