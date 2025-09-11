'use client';

import React from 'react';
import { useLottery } from '@/hooks/useLottery';
import { formatCountdown } from '@/lib/roundManager';

interface CountdownTimerProps {
  className?: string;
}

export default function CountdownTimer({ className = '' }: CountdownTimerProps) {
  const { currentRound, useCountdown } = useLottery();
  
  // 使用當前輪次的結束時間進行倒數計時
  const countdownQuery = useCountdown(currentRound?.end_time || 0);
  const timeLeft = countdownQuery.data;

  if (!currentRound || !timeLeft) {
    return (
      <div className={`text-gray-500 ${className}`}>
        載入中...
      </div>
    );
  }

  // 如果時間已經結束
  if (timeLeft.total <= 0) {
    return (
      <div className={`text-red-500 font-semibold ${className}`}>
        本期已結束
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-sm text-gray-600 mb-1">
        距離本期結束還有：
      </div>
      <div className="text-lg font-bold text-blue-600">
        {formatCountdown(timeLeft)}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        期數：{currentRound.round_id}
      </div>
    </div>
  );
}
