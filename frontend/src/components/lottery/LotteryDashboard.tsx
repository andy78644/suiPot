'use client';

import React from 'react';
import { useLottery } from '@/hooks/useLottery';
import CountdownTimer from './CountdownTimer';
import Button from '@/components/ui/Button';

interface LotteryDashboardProps {
  className?: string;
}

export default function LotteryDashboard({ className = '' }: LotteryDashboardProps) {
  const { 
    currentRound, 
    nextRound, 
    isLoadingRounds, 
    purchaseTickets, 
    isPurchasing 
  } = useLottery();

  const handleQuickPurchase = () => {
    if (!currentRound) return;
    
    // 快速購買：隨機生成一組號碼
    const randomNumbers = generateRandomNumbers();
    purchaseTickets({
      roundId: currentRound.round_id,
      numberSets: [randomNumbers]
    });
  };

  const generateRandomNumbers = (): number[] => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  if (isLoadingRounds) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">載入樂透資訊中...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 當前期數資訊 */}
      {currentRound && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                第 {currentRound.round_id.replace('round_', '')} 期
              </h2>
              <p className="text-gray-600">
                狀態：
                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                  currentRound.status === 'Open' 
                    ? 'bg-green-100 text-green-800'
                    : currentRound.status === 'Drawing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentRound.status === 'Open' ? '投注中' : 
                   currentRound.status === 'Drawing' ? '開獎中' : '已結束'}
                </span>
              </p>
            </div>
            
            <CountdownTimer className="text-right" />
          </div>

          {/* 獎池資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">總獎池</div>
              <div className="text-2xl font-bold text-blue-800">
                {currentRound.prize_pool.toLocaleString()} SUI
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">票價</div>
              <div className="text-2xl font-bold text-green-800">
                {currentRound.ticket_price} SUI
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">已售票數</div>
              <div className="text-2xl font-bold text-purple-800">
                {currentRound.total_tickets_sold.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 快速購票 */}
          {currentRound.status === 'Open' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleQuickPurchase}
                loading={isPurchasing}
                className="flex-1"
              >
                快速購票 (隨機號碼)
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // TODO: 導航到詳細購票頁面
                  console.log('Navigate to detailed purchase page');
                }}
              >
                選擇號碼購票
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 下一期預告 */}
      {nextRound && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            下一期預告
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">期數</div>
              <div className="font-semibold">
                第 {nextRound.round_id.replace('round_', '')} 期
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">開始時間</div>
              <div className="font-semibold">
                {new Date(nextRound.start_time).toLocaleString('zh-TW')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 獎金分配說明 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          獎金分配
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">65%</div>
            <div className="text-sm text-gray-600">頭獎 (6個號碼)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-silver-600">20%</div>
            <div className="text-sm text-gray-600">二獎 (5個號碼)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">10%</div>
            <div className="text-sm text-gray-600">三獎 (4個號碼)</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          * 5% 作為平台手續費
        </div>
      </div>
    </div>
  );
}
