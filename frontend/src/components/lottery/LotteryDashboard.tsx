'use client';

import React, { useState } from 'react';
import { useLottery } from '@/hooks/useLottery';
import CountdownTimer from './CountdownTimer';
import Button from '@/components/ui/Button';

interface LotteryDashboardProps {
  className?: string;
  showDevTools?: boolean; // 是否顯示開發工具
}

export default function LotteryDashboard({ 
  className = '', 
  showDevTools = false 
}: LotteryDashboardProps) {
  const { 
    currentRound, 
    nextRound, 
    isLoadingRounds, 
    purchaseTickets, 
    isPurchasing 
  } = useLottery();

  // 開發模式下的數據修改狀態
  const [devData, setDevData] = useState({
    prizePool: currentRound?.prize_pool || 0,
    ticketsSold: currentRound?.total_tickets_sold || 0,
    roundStatus: currentRound?.status || 'Open',
    winningNumbers: null as number[] | null
  });

  // 模擬開獎功能
  const handleMockDraw = () => {
    const winningNumbers = generateRandomNumbers();
    setDevData(prev => ({
      ...prev,
      winningNumbers,
      roundStatus: 'Closed'
    }));
    console.log('模擬開獎號碼:', winningNumbers);
  };

  const handleQuickPurchase = () => {
    if (!currentRound) return;
    
    // 快速購買：隨機生成一組號碼
    const randomNumbers = generateRandomNumbers();
    
    if (showDevTools) {
      // 開發模式：模擬購票成功，更新本地數據
      setDevData(prev => ({
        ...prev,
        ticketsSold: prev.ticketsSold + 1,
        prizePool: prev.prizePool + currentRound.ticket_price
      }));
      console.log('模擬購票成功:', randomNumbers);
    } else {
      // 真實模式：實際發送交易
      purchaseTickets({
        roundId: currentRound.round_id,
        numberSets: [randomNumbers]
      });
    }
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
                {showDevTools && (
                  <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    模擬模式
                  </span>
                )}
              </h2>
              <p className="text-gray-600">
                狀態：
                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                  (showDevTools ? devData.roundStatus : currentRound.status) === 'Open' 
                    ? 'bg-green-100 text-green-800'
                    : (showDevTools ? devData.roundStatus : currentRound.status) === 'Drawing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(showDevTools ? devData.roundStatus : currentRound.status) === 'Open' ? '投注中' : 
                   (showDevTools ? devData.roundStatus : currentRound.status) === 'Drawing' ? '開獎中' : '已結束'}
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
                {(showDevTools ? devData.prizePool : currentRound.prize_pool).toLocaleString()} SUI
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
                {(showDevTools ? devData.ticketsSold : currentRound.total_tickets_sold).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 快速購票 */}
          {(showDevTools ? devData.roundStatus : currentRound.status) === 'Open' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleQuickPurchase}
                loading={!showDevTools && isPurchasing}
                className="flex-1"
              >
                {showDevTools ? '模擬購票 (隨機號碼)' : '快速購票 (隨機號碼)'}
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

          {/* 開獎結果顯示 */}
          {showDevTools && devData.winningNumbers && devData.roundStatus === 'Closed' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">🎉 開獎結果</h4>
              <div className="flex gap-3 justify-center">
                {devData.winningNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  >
                    {number}
                  </div>
                ))}
              </div>
              <p className="text-center text-blue-700 mt-3 text-sm">
                恭喜所有中獎者！請檢查您的彩票
              </p>
            </div>
          )}

          {/* 開發工具 */}
          {showDevTools && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3">🛠️ 開發工具</h4>
              
              {/* 數據調整工具 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    獎池金額 (SUI)
                  </label>
                  <input
                    type="number"
                    value={devData.prizePool}
                    onChange={(e) => setDevData(prev => ({
                      ...prev,
                      prizePool: Number(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    已售票數
                  </label>
                  <input
                    type="number"
                    value={devData.ticketsSold}
                    onChange={(e) => setDevData(prev => ({
                      ...prev,
                      ticketsSold: Number(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    輪次狀態
                  </label>
                  <select
                    value={devData.roundStatus}
                    onChange={(e) => setDevData(prev => ({
                      ...prev,
                      roundStatus: e.target.value as 'Open' | 'Drawing' | 'Closed'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">投注中</option>
                    <option value="Drawing">開獎中</option>
                    <option value="Closed">已結束</option>
                  </select>
                </div>
              </div>
              
              {/* 快速操作按鈕 */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDevData(prev => ({
                      ...prev,
                      ticketsSold: prev.ticketsSold + 10,
                      prizePool: prev.prizePool + (currentRound.ticket_price * 10)
                    }));
                  }}
                  size="sm"
                >
                  +10 張票
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDevData(prev => ({
                      ...prev,
                      prizePool: prev.prizePool + 1000
                    }));
                  }}
                  size="sm"
                >
                  +1000 SUI 獎池
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleMockDraw}
                  size="sm"
                  className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  🎱 模擬開獎
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDevData({
                      prizePool: currentRound?.prize_pool || 0,
                      ticketsSold: currentRound?.total_tickets_sold || 0,
                      roundStatus: currentRound?.status || 'Open',
                      winningNumbers: null
                    });
                  }}
                  size="sm"
                  className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  🔄 重置
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDevData({
                      prizePool: currentRound.prize_pool,
                      ticketsSold: currentRound.total_tickets_sold,
                      roundStatus: currentRound.status,
                      winningNumbers: null
                    });
                  }}
                  size="sm"
                  className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  🔄 重置
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newStatus = devData.roundStatus === 'Open' ? 'Drawing' : 
                                     devData.roundStatus === 'Drawing' ? 'Closed' : 'Open';
                    setDevData(prev => ({
                      ...prev,
                      roundStatus: newStatus
                    }));
                  }}
                  size="sm"
                >
                  切換狀態
                </Button>
              </div>
              
              {/* 開獎號碼顯示 */}
              {devData.winningNumbers && (
                <div className="mt-4 p-3 bg-white border border-yellow-300 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">🎯 模擬開獎結果</h5>
                  <div className="flex gap-2">
                    {devData.winningNumbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-yellow-700 mt-3">
                💡 這些修改只會影響前端顯示，不會影響真實的區塊鏈數據
              </p>
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
