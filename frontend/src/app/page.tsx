'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useLottery } from '@/hooks/useLottery';
import Button from '@/components/ui/Button';
import { formatNumber, formatCountdown, generateRandomNumbers, validateNumbers } from '@/lib/utils';
import { LOTTERY_CONSTANTS } from '@/constants/lottery';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { isConnected, balance } = useWallet();
  const { 
    lottery, 
    userTickets, 
    isLoading, 
    buyTicket, 
    isBuying 
  } = useLottery();

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

  // 快選
  const quickPick = () => {
    const numbers = generateRandomNumbers();
    setSelectedNumbers(numbers);
    toast.success('已為您隨機選擇號碼');
  };

  // 清除選擇
  const clearSelection = () => {
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
      toast.error(validation.error || '號碼選擇無效');
      return;
    }

    try {
      await buyTicket(selectedNumbers);
      toast.success('購票成功！');
      setSelectedNumbers([]);
    } catch (error) {
      console.error('購票失敗:', error);
      toast.error('購票失敗，請重試');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">加載中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 頭部 */}
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            SuiPot Lotto
          </h1>
          
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="text-white">
                <div className="text-sm opacity-75">錢包餘額</div>
                <div className="font-bold">{formatNumber(balance)} SUI</div>
              </div>
            ) : (
              <Button variant="primary">
                連接錢包
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 彩票資訊 */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                第 {lottery?.round || 1} 期
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatNumber(Number(lottery?.currentPool || 0) / 1e9)} SUI
                  </div>
                  <div className="text-white/75">獎金池</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {lottery?.totalTickets || 0}
                  </div>
                  <div className="text-white/75">售出彩票</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatNumber(Number(lottery?.ticketPrice || 0) / 1e9)} SUI
                  </div>
                  <div className="text-white/75">彩票價格</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {countdown > 0 ? formatCountdown(countdown) : '已截止'}
                  </div>
                  <div className="text-white/75">開獎倒數</div>
                </div>
              </div>

              {/* 中獎號碼 */}
              {lottery?.winningNumbers && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">中獎號碼</h3>
                  <div className="flex gap-2">
                    {lottery.winningNumbers.map((num, index) => (
                      <div 
                        key={index}
                        className="w-12 h-12 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 號碼選擇 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  選擇您的幸運號碼 ({selectedNumbers.length}/{LOTTERY_CONSTANTS.NUMBERS_PER_TICKET})
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={quickPick}
                  >
                    快選
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearSelection}
                  >
                    清除
                  </Button>
                </div>
              </div>

              {/* 號碼網格 */}
              <div className="grid grid-cols-10 gap-2 mb-6">
                {Array.from({ length: LOTTERY_CONSTANTS.MAX_NUMBER }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`
                      aspect-square rounded-lg border-2 font-semibold transition-all
                      ${selectedNumbers.includes(num)
                        ? 'bg-yellow-400 border-yellow-400 text-black'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 已選號碼顯示 */}
              {selectedNumbers.length > 0 && (
                <div className="mb-4">
                  <div className="text-white/75 mb-2">已選號碼：</div>
                  <div className="flex gap-2">
                    {selectedNumbers.map((num, index) => (
                      <div 
                        key={index}
                        className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 購買按鈕 */}
              <Button
                onClick={handleBuyTicket}
                disabled={!isConnected || selectedNumbers.length !== LOTTERY_CONSTANTS.NUMBERS_PER_TICKET || isBuying || countdown <= 0}
                className="w-full"
                size="lg"
              >
                {!isConnected 
                  ? '請連接錢包' 
                  : countdown <= 0
                  ? '本期已截止'
                  : isBuying 
                  ? '購買中...' 
                  : `購買彩票 (${formatNumber(Number(lottery?.ticketPrice || 0) / 1e9)} SUI)`
                }
              </Button>
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 我的彩票 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">我的彩票</h3>
              
              {!isConnected ? (
                <div className="text-white/75 text-center py-8">
                  請連接錢包查看您的彩票
                </div>
              ) : userTickets.length === 0 ? (
                <div className="text-white/75 text-center py-8">
                  您還沒有購買彩票
                </div>
              ) : (
                <div className="space-y-3">
                  {userTickets.slice(0, 5).map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/75 text-sm">第 {ticket.round} 期</span>
                        {ticket.winningTier && (
                          <span className="text-yellow-400 text-sm font-semibold">
                            {ticket.winningTier === 1 ? '頭獎' : 
                             ticket.winningTier === 2 ? '二獎' : '三獎'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {ticket.numbers.map((num, index) => (
                          <div 
                            key={index}
                            className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {userTickets.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        查看全部 ({userTickets.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 中獎資訊 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">中獎資訊</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/75">頭獎 (6個號碼)</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatNumber(Number(lottery?.prizePool.tier1 || 0) / 1e9)} SUI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/75">二獎 (5個號碼)</span>
                  <span className="text-blue-400 font-semibold">
                    {formatNumber(Number(lottery?.prizePool.tier2 || 0) / 1e9)} SUI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/75">三獎 (4個號碼)</span>
                  <span className="text-green-400 font-semibold">
                    {formatNumber(Number(lottery?.prizePool.tier3 || 0) / 1e9)} SUI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
