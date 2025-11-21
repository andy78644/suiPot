'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useLottery } from '@/hooks/useLottery';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';
import type { Ticket } from '@/types/lottery';

export default function MyTicketsPage() {
  const { userTickets, isLoadingTickets, claimPrize, isClaiming } = useLottery();
  const { address, isConnected } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'unclaimed' | 'claimed' | 'expired'>('unclaimed');

  // 模擬數據（當合約未連接時）
  const mockTickets: Ticket[] = [
    {
      id: '1',
      round_id: 'round_1',
      owner: address || '',
      numbers: [5, 12, 23, 34, 41, 48],
      ticket_number: 1,
      purchased_at: Date.now() - 86400000 * 2, // 2 天前
      claimed: false,
      winning_tier: 3, // 三獎
    },
    {
      id: '2',
      round_id: 'round_1',
      owner: address || '',
      numbers: [1, 10, 20, 30, 40, 50],
      ticket_number: 2,
      purchased_at: Date.now() - 86400000 * 2,
      claimed: false,
    },
    {
      id: '3',
      round_id: 'round_0',
      owner: address || '',
      numbers: [7, 14, 21, 28, 35, 42],
      ticket_number: 5,
      purchased_at: Date.now() - 86400000 * 10, // 10 天前
      claimed: true,
      winning_tier: 2, // 二獎
    },
  ];

  const displayTickets = userTickets.length > 0 ? userTickets : mockTickets;

  // 按狀態分類彩券
  const unclaimedTickets = displayTickets.filter(t => !t.claimed && t.winning_tier);
  const regularTickets = displayTickets.filter(t => !t.claimed && !t.winning_tier);
  const claimedTickets = displayTickets.filter(t => t.claimed);
  const expiredTickets: Ticket[] = []; // TODO: 實現逾期邏輯

  const handleClaim = (ticketIds: string[]) => {
    claimPrize({ ticketIds });
  };

  const renderTicketCard = (ticket: Ticket) => {
    const isWinning = ticket.winning_tier && ticket.winning_tier > 0;
    const tierNames = ['', '頭獎', '二獎', '三獎'];
    const tierColors = ['', 'bg-yellow-50 border-yellow-300', 'bg-blue-50 border-blue-300', 'bg-green-50 border-green-300'];

    return (
      <div
        key={ticket.id}
        className={`p-4 rounded-lg border-2 ${
          isWinning ? tierColors[ticket.winning_tier || 0] : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-sm text-gray-600">
              第 {ticket.round_id.replace('round_', '')} 期 · 票號 {ticket.ticket_number}
            </div>
            {isWinning && (
              <div className="mt-1">
                <span className="px-2 py-1 text-xs font-bold rounded bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  🎉 {tierNames[ticket.winning_tier || 0]}
                </span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(ticket.purchased_at).toLocaleDateString('zh-TW')}
          </div>
        </div>

        {/* 號碼顯示 */}
        <div className="flex gap-2 mb-3">
          {ticket.numbers.map((num, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                isWinning
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* 操作按鈕 */}
        {isWinning && !ticket.claimed && (
          <Button
            onClick={() => handleClaim([ticket.id])}
            loading={isClaiming}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            size="sm"
          >
            領取獎金
          </Button>
        )}

        {ticket.claimed && (
          <div className="text-center py-2 text-sm text-green-600 font-medium">
            ✓ 已領獎
          </div>
        )}
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">請先連接錢包</h2>
            <p className="text-gray-600">連接錢包後即可查看您的彩券</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的彩券</h1>
          <p className="text-gray-600">查看您購買的彩券和中獎記錄</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">總彩券數</div>
            <div className="text-2xl font-bold text-gray-900">{displayTickets.length}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow p-4">
            <div className="text-sm text-orange-700 mb-1">待領獎</div>
            <div className="text-2xl font-bold text-orange-600">{unclaimedTickets.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-700 mb-1">已領獎</div>
            <div className="text-2xl font-bold text-green-600">{claimedTickets.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">逾期</div>
            <div className="text-2xl font-bold text-gray-500">{expiredTickets.length}</div>
          </div>
        </div>

        {/* 分頁標籤 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedTab('unclaimed')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'unclaimed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                未開獎/待領獎
                {(unclaimedTickets.length + regularTickets.length) > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {unclaimedTickets.length + regularTickets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSelectedTab('claimed')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'claimed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                已領獎
                {claimedTickets.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {claimedTickets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSelectedTab('expired')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'expired'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                逾期
                {expiredTickets.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {expiredTickets.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* 彩券列表 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isLoadingTickets ? (
            <div className="text-center py-12">
              <div className="text-gray-500">載入中...</div>
            </div>
          ) : (
            <>
              {selectedTab === 'unclaimed' && (
                <div className="space-y-4">
                  {unclaimedTickets.length === 0 && regularTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🎫</div>
                      <div className="text-gray-500">暫無未開獎的彩券</div>
                    </div>
                  ) : (
                    <>
                      {/* 中獎待領取 */}
                      {unclaimedTickets.length > 0 && (
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-orange-600">
                              🎉 恭喜中獎！待領取
                            </h3>
                            {unclaimedTickets.length > 1 && (
                              <Button
                                onClick={() => handleClaim(unclaimedTickets.map(t => t.id))}
                                loading={isClaiming}
                                size="sm"
                                className="bg-gradient-to-r from-yellow-500 to-orange-500"
                              >
                                批量領取 ({unclaimedTickets.length} 張)
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unclaimedTickets.map(renderTicketCard)}
                          </div>
                        </div>
                      )}

                      {/* 未開獎 */}
                      {regularTickets.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-700 mb-4">
                            等待開獎
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {regularTickets.map(renderTicketCard)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {selectedTab === 'claimed' && (
                <div>
                  {claimedTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">💰</div>
                      <div className="text-gray-500">暫無已領獎記錄</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {claimedTickets.map(renderTicketCard)}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'expired' && (
                <div>
                  {expiredTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">⏰</div>
                      <div className="text-gray-500">暫無逾期彩券</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {expiredTickets.map(renderTicketCard)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
