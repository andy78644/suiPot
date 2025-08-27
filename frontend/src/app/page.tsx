'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useLottery } from '@/hooks/useLottery';
import { useMockLottery } from '@/hooks/useMockLottery';
import { Navbar } from '@/components/layout/Navbar';
import { WalletConnector } from '@/components/wallet/WalletConnector';
import Button from '@/components/ui/Button';
import { formatNumber, formatCountdown, generateRandomNumbers, validateNumbers } from '@/lib/utils';
import { LOTTERY_CONSTANTS } from '@/constants/lottery';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { isConnected } = useWallet();
  
  // 檢查是否使用模擬數據
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  
  // 根據設定選擇使用真實或模擬數據
  const realLottery = useLottery();
  const mockLottery = useMockLottery();
  
  const lotteryHook = useMockData ? mockLottery : realLottery;
  const { 
    lottery, 
    userTickets, 
    isLoading, 
    buyTicket, 
    isBuying 
  } = lotteryHook;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(0);

  // 倒數計時器
  useEffect(() => {
    if (!lottery?.drawTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lottery.drawTime - now) / 1000));
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [lottery?.drawTime]);

  // 選擇號碼
  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      } else if (prev.length < LOTTERY_CONSTANTS.NUMBERS_PER_TICKET) {
        return [...prev, num].sort((a, b) => a - b);
      } else {
        toast.error(`最多只能選擇 ${LOTTERY_CONSTANTS.NUMBERS_PER_TICKET} 個號碼`);
        return prev;
      }
    });
  };

  // 隨機選號
  const randomSelect = () => {
    const randomNumbers = generateRandomNumbers();
    setSelectedNumbers(randomNumbers);
  };

  // 清除選號
  const clearNumbers = () => {
    setSelectedNumbers([]);
  };

  // 購買彩票
  const handleBuyTicket = async () => {
    if (!isConnected) {
      toast.error('請先連接錢包');
      return;
    }

    const validation = validateNumbers(selectedNumbers);
    if (!validation.isValid) {
      toast.error(validation.error || '選號無效');
      return;
    }

    const success = await buyTicket(selectedNumbers);
    if (success) {
      setSelectedNumbers([]);
      toast.success('購票成功！');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">加載中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 歡迎區域 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            歡迎來到 SuiPot Lotto
          </h2>
          <p className="text-lg text-gray-600">
            基於 Sui 區塊鏈的去中心化彩票遊戲
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側 - 彩票信息 */}
          <div className="lg:col-span-2">
            {lottery && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  第 {lottery.round} 期彩票
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(Number(lottery.currentPool) / 1_000_000_000)} SUI
                    </div>
                    <div className="text-sm text-gray-500">總獎池</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(Number(lottery.ticketPrice) / 1_000_000_000)} SUI
                    </div>
                    <div className="text-sm text-gray-500">票價</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {lottery.totalTickets}
                    </div>
                    <div className="text-sm text-gray-500">已售票數</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCountdown(countdown)}
                    </div>
                    <div className="text-sm text-gray-500">開獎倒數</div>
                  </div>
                </div>

                {lottery.state === 'OPEN' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">選擇您的幸運號碼</h4>
                    
                    {/* 號碼選擇區 */}
                    <div className="grid grid-cols-10 gap-2 mb-6">
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => toggleNumber(num)}
                          className={`
                            w-10 h-10 rounded-lg font-semibold transition-colors
                            ${selectedNumbers.includes(num)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    {/* 已選號碼顯示 */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        已選號碼 ({selectedNumbers.length}/{LOTTERY_CONSTANTS.NUMBERS_PER_TICKET}):
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {selectedNumbers.map((num) => (
                          <span
                            key={num}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant="outline"
                        onClick={randomSelect}
                        size="sm"
                      >
                        隨機選號
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={clearNumbers}
                        size="sm"
                      >
                        清除選號
                      </Button>
                    </div>

                    {/* 購買按鈕 */}
                    {isConnected ? (
                      <Button
                        onClick={handleBuyTicket}
                        disabled={selectedNumbers.length !== LOTTERY_CONSTANTS.NUMBERS_PER_TICKET || isBuying}
                        loading={isBuying}
                        className="w-full"
                      >
                        {isBuying ? '購買中...' : `購買彩票 (${formatNumber(Number(lottery.ticketPrice) / 1_000_000_000)} SUI)`}
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700">請先連接錢包以購買彩票</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 中獎號碼顯示 */}
                {lottery.winningNumbers && lottery.winningNumbers.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">中獎號碼</h4>
                    <div className="flex gap-2">
                      {lottery.winningNumbers.map((num, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 我的彩票 */}
            {userTickets && userTickets.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  我的彩票 ({userTickets.length})
                </h3>
                <div className="space-y-3">
                  {userTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex gap-2">
                        {ticket.numbers.map((num, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        第 {ticket.round} 期
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側 - 錢包信息 */}
          <div className="space-y-6">
            <WalletConnector />
            
            {/* 遊戲說明 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">遊戲說明</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• 選擇 6 個號碼 (1-50)</p>
                <p>• 每張彩票 0.1 SUI</p>
                <p>• 每期開獎時間為每周日晚上 8 點</p>
                <p>• 獎金池按比例分配給中獎者</p>
                <p>• 所有交易都在 Sui 區塊鏈上透明執行</p>
              </div>
            </div>

            {/* 獎金分配 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">獎金分配</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">一等獎 (6個號碼)</span>
                  <span className="font-semibold text-yellow-600">60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">二等獎 (5個號碼)</span>
                  <span className="font-semibold text-blue-600">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">三等獎 (4個號碼)</span>
                  <span className="font-semibold text-green-600">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 開發工具 - 只在模擬模式下顯示 */}
        {useMockData && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-4">🛠️ 開發工具</h3>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  if ('toggleLotteryState' in mockLottery) {
                    (mockLottery as { toggleLotteryState: () => void }).toggleLotteryState();
                  }
                }}
                size="sm"
              >
                切換彩票狀態 (當前: {lottery?.state})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if ('resetMockData' in mockLottery) {
                    (mockLottery as { resetMockData: () => void }).resetMockData();
                  }
                }}
                size="sm"
              >
                重置模擬數據
              </Button>
              {lottery?.state === 'OPEN' && (
                <Button
                  variant="outline"
                  onClick={() => mockLottery.draw()}
                  disabled={mockLottery.isDrawing}
                  size="sm"
                >
                  {mockLottery.isDrawing ? '開獎中...' : '執行開獎'}
                </Button>
              )}
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              💡 這些工具只在開發模式下可見，幫助您測試各種功能
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
