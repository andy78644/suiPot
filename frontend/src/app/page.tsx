'use client';

import React from 'react';
import { useLottery } from '@/hooks/useLottery';
import { Navbar } from '@/components/layout/Navbar';
import { WalletConnector } from '@/components/wallet/WalletConnector';
import LotteryDashboard from '@/components/lottery/LotteryDashboard';
import CountdownTimer from '@/components/lottery/CountdownTimer';

export default function HomePage() {
  // 檢查是否使用模擬數據
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  
  // 根據設定選擇使用真實或模擬數據
  const realLottery = useLottery();

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
          {useMockData && (
            <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              🚧 模擬模式
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容區域 */}
          <div className="lg:col-span-3">
            {/* 統一使用 LotteryDashboard，模擬模式通過 showDevTools 參數控制 */}
            <LotteryDashboard showDevTools={useMockData} />
          </div>

          {/* 右側邊欄 */}
          <div className="space-y-6">
            {/* 錢包連接 */}
            <WalletConnector />
            
            {/* 倒數計時 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ 開獎倒數</h3>
              <CountdownTimer />
            </div>
            
            {/* 遊戲說明 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 遊戲說明</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• 選擇 6 個號碼 (1-50)</p>
                <p>• 每張彩票 1 SUI</p>
                <p>• 每期持續 7 天</p>
                <p>• 自動開獎和獎金分配</p>
                <p>• 所有交易都在 Sui 區塊鏈上透明執行</p>
                {useMockData && (
                  <p className="text-yellow-600 font-medium">• 🚧 模擬模式：可調整數值進行測試</p>
                )}
              </div>
            </div>

            {/* 獎金分配 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 獎金分配</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">頭獎 (6個號碼)</span>
                  <span className="font-semibold text-yellow-600">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">二獎 (5個號碼)</span>
                  <span className="font-semibold text-blue-600">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">三獎 (4個號碼)</span>
                  <span className="font-semibold text-green-600">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平台手續費</span>
                  <span className="font-semibold text-gray-600">5%</span>
                </div>
              </div>
            </div>

            {/* 輪次資訊 */}
            {realLottery.currentRound && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎲 當前輪次</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">期數：</span>
                    <span className="font-semibold">
                      第 {realLottery.currentRound.round_id.replace('round_', '')} 期
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">狀態：</span>
                    <span className={`font-semibold ${
                      realLottery.currentRound.status === 'Open' ? 'text-green-600' :
                      realLottery.currentRound.status === 'Drawing' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {realLottery.currentRound.status === 'Open' ? '投注中' :
                       realLottery.currentRound.status === 'Drawing' ? '開獎中' : '已結束'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">開始時間：</span>
                    <span className="font-semibold text-xs">
                      {new Date(realLottery.currentRound.start_time).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  {useMockData && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                      模擬模式：可在左側面板調整數值
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
