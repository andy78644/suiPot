'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';

export default function AdminPage() {
  const { address, isConnected } = useWallet();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 新建輪次表單
  const [newRoundForm, setNewRoundForm] = useState({
    ticketPrice: '1',
    duration: '7', // 天數
  });

  // 提領表單
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
  });

  // 模擬數據
  const mockTreasuryBalance = 125.5;
  const mockRolloverBalance = 50.3;
  const mockCurrentRoundId = 'round_4';

  // 管理員操作
  const handleCreateRound = async () => {
    setIsCreating(true);
    try {
      // TODO: 調用智能合約創建新輪次
      console.log('創建新輪次:', newRoundForm);

      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`成功創建新輪次！\n票價: ${newRoundForm.ticketPrice} SUI\n持續時間: ${newRoundForm.duration} 天`);

      // 重置表單
      setNewRoundForm({ ticketPrice: '1', duration: '7' });
    } catch (error) {
      console.error('創建輪次失敗:', error);
      alert('創建失敗，請重試');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      // TODO: 調用智能合約手動開獎
      console.log('手動開獎:', mockCurrentRoundId);

      await new Promise(resolve => setTimeout(resolve, 3000));

      alert('開獎成功！中獎號碼已生成');
    } catch (error) {
      console.error('開獎失敗:', error);
      alert('開獎失敗，請重試');
    } finally {
      setIsDrawing(false);
    }
  };

  const handlePauseToggle = async () => {
    setIsPausing(true);
    try {
      // TODO: 調用智能合約暫停/恢復系統
      console.log(isPaused ? '恢復系統' : '暫停系統');

      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsPaused(!isPaused);
      alert(isPaused ? '系統已恢復運行' : '系統已暫停');
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請重試');
    } finally {
      setIsPausing(false);
    }
  };

  const handleWithdrawFees = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      alert('請輸入有效的提領金額');
      return;
    }

    if (parseFloat(withdrawForm.amount) > mockTreasuryBalance) {
      alert('提領金額超過可用餘額');
      return;
    }

    setIsWithdrawing(true);
    try {
      // TODO: 調用智能合約提領手續費
      console.log('提領手續費:', withdrawForm.amount);

      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`成功提領 ${withdrawForm.amount} SUI`);
      setWithdrawForm({ amount: '' });
    } catch (error) {
      console.error('提領失敗:', error);
      alert('提領失敗，請重試');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 檢查是否為管理員（這裡簡化處理，實際應該檢查 AdminCap）
  const isAdmin = isConnected; // TODO: 實際檢查管理員權限

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">請先連接錢包</h2>
            <p className="text-gray-600">需要連接錢包才能訪問管理員功能</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">權限不足</h2>
            <p className="text-gray-600">您沒有管理員權限</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理員控制台</h1>
          <p className="text-gray-600">管理樂透系統的核心功能</p>
        </div>

        {/* 系統狀態 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">系統狀態</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isPaused ? 'bg-red-500' : 'bg-green-500'
                  } animate-pulse`}
                />
                <span className="text-gray-700 font-medium">
                  {isPaused ? '已暫停' : '運行中'}
                </span>
              </div>
            </div>
            <Button
              onClick={handlePauseToggle}
              loading={isPausing}
              variant={isPaused ? 'primary' : 'outline'}
              className={isPaused ? 'bg-green-600 hover:bg-green-700' : 'border-red-500 text-red-600 hover:bg-red-50'}
            >
              {isPaused ? '恢復系統' : '暫停系統'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側 - 輪次管理 */}
          <div className="space-y-8">
            {/* 創建新輪次 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 創建新輪次</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    彩票價格 (SUI)
                  </label>
                  <input
                    type="number"
                    value={newRoundForm.ticketPrice}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, ticketPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    step="0.1"
                    min="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    持續時間 (天)
                  </label>
                  <input
                    type="number"
                    value={newRoundForm.duration}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="7"
                    min="1"
                    max="14"
                  />
                  <p className="text-xs text-gray-500 mt-1">最長 14 天</p>
                </div>

                <Button
                  onClick={handleCreateRound}
                  loading={isCreating}
                  className="w-full"
                >
                  創建新輪次
                </Button>
              </div>
            </div>

            {/* 手動開獎 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎱 手動開獎</h2>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">當前輪次</div>
                <div className="text-lg font-bold text-blue-900">
                  {mockCurrentRoundId.replace('round_', '')} 期
                </div>
              </div>

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 請確保當前輪次已結束後再執行開獎操作
                </p>
              </div>

              <Button
                onClick={handleDraw}
                loading={isDrawing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                執行開獎
              </Button>
            </div>
          </div>

          {/* 右側 - 財務管理 */}
          <div className="space-y-8">
            {/* 金庫狀態 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💰 金庫狀態</h2>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">手續費餘額</div>
                  <div className="text-3xl font-bold text-green-600">
                    {mockTreasuryBalance.toLocaleString()} SUI
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">Rollover 餘額</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {mockRolloverBalance.toLocaleString()} SUI
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    空獎級獎金將自動滾入下一輪
                  </p>
                </div>
              </div>
            </div>

            {/* 提領手續費 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💸 提領手續費</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提領金額 (SUI)
                  </label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入提領金額"
                    step="0.1"
                    min="0.1"
                    max={mockTreasuryBalance}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    可用餘額: {mockTreasuryBalance.toLocaleString()} SUI
                  </p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    💡 提領的資金將轉入您的錢包地址
                  </p>
                </div>

                <Button
                  onClick={handleWithdrawFees}
                  loading={isWithdrawing}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  提領到錢包
                </Button>
              </div>
            </div>

            {/* 系統配置 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ 系統配置</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">手續費比例</span>
                  <span className="font-medium">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最大輪期長度</span>
                  <span className="font-medium">14 天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">單次最大購票數</span>
                  <span className="font-medium">50 張</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">領獎期限</span>
                  <span className="font-medium">90 天</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => alert('配置修改功能即將上線')}
                >
                  修改配置
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
