'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import type { LotteryRound } from '@/types/lottery';

export default function HistoryPage() {
  const [selectedRound, setSelectedRound] = useState<LotteryRound | null>(null);

  // 模擬歷史輪次數據
  const mockHistoryRounds: LotteryRound[] = [
    {
      round_id: 'round_3',
      token_type: 'SUI',
      ticket_price: 1,
      start_time: Date.now() - 86400000 * 21, // 21 天前
      end_time: Date.now() - 86400000 * 14,
      draw_time: Date.now() - 86400000 * 14,
      status: 'Closed',
      total_tickets_sold: 1250,
      prize_pool: 1187.5, // 95% of 1250
      winning_numbers: [7, 15, 23, 31, 42, 49],
      is_current: false,
      expires_at: Date.now() + 86400000 * 76, // 90 天後過期
      prizes: {
        tier1: 771.875, // 65%
        tier2: 237.5,   // 20%
        tier3: 118.75,  // 10%
      },
    },
    {
      round_id: 'round_2',
      token_type: 'SUI',
      ticket_price: 1,
      start_time: Date.now() - 86400000 * 28,
      end_time: Date.now() - 86400000 * 21,
      draw_time: Date.now() - 86400000 * 21,
      status: 'Closed',
      total_tickets_sold: 890,
      prize_pool: 845.5,
      winning_numbers: [3, 12, 18, 27, 38, 45],
      is_current: false,
      expires_at: Date.now() + 86400000 * 69,
      prizes: {
        tier1: 549.575,
        tier2: 169.1,
        tier3: 84.55,
      },
    },
    {
      round_id: 'round_1',
      token_type: 'SUI',
      ticket_price: 1,
      start_time: Date.now() - 86400000 * 35,
      end_time: Date.now() - 86400000 * 28,
      draw_time: Date.now() - 86400000 * 28,
      status: 'Closed',
      total_tickets_sold: 567,
      prize_pool: 538.65,
      winning_numbers: [5, 10, 20, 30, 40, 48],
      is_current: false,
      expires_at: Date.now() + 86400000 * 62,
      prizes: {
        tier1: 350.1225,
        tier2: 107.73,
        tier3: 53.865,
      },
    },
  ];

  const RoundCard = ({ round }: { round: LotteryRound }) => {
    const daysAgo = Math.floor((Date.now() - round.draw_time) / 86400000);

    return (
      <div
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedRound(round)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              第 {round.round_id.replace('round_', '')} 期
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {daysAgo} 天前開獎
            </p>
          </div>
          <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            已結束
          </div>
        </div>

        {/* 中獎號碼 */}
        {round.winning_numbers && round.winning_numbers.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">中獎號碼</div>
            <div className="flex gap-2">
              {round.winning_numbers.map((num, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 統計信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600">總獎池</div>
            <div className="text-lg font-bold text-blue-600">
              {round.prize_pool.toLocaleString()} SUI
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">售出票數</div>
            <div className="text-lg font-bold text-purple-600">
              {round.total_tickets_sold.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 查看詳情提示 */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            點擊查看詳情 →
          </span>
        </div>
      </div>
    );
  };

  const RoundDetailModal = ({ round }: { round: LotteryRound }) => {
    if (!round) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedRound(null)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              第 {round.round_id.replace('round_', '')} 期詳情
            </h2>
            <button
              onClick={() => setSelectedRound(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 中獎號碼 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">🎱 中獎號碼</h3>
              <div className="flex gap-3 justify-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                {round.winning_numbers?.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* 時間信息 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">📅 時間信息</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">開始時間</span>
                  <span className="font-medium">
                    {new Date(round.start_time).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">結束時間</span>
                  <span className="font-medium">
                    {new Date(round.end_time).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">開獎時間</span>
                  <span className="font-medium">
                    {new Date(round.draw_time).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">領獎截止</span>
                  <span className="font-medium text-orange-600">
                    {new Date(round.expires_at).toLocaleString('zh-TW')}
                  </span>
                </div>
              </div>
            </div>

            {/* 獎池信息 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">💰 獎池信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-700">總獎池</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {round.prize_pool.toLocaleString()} SUI
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-700">售出票數</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {round.total_tickets_sold.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 獎金分配 */}
            {round.prizes && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">🏆 獎金分配</h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-yellow-700">頭獎 (6個號碼)</div>
                      <div className="text-sm text-yellow-600">65% 獎池</div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {round.prizes.tier1.toLocaleString()} SUI
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-blue-700">二獎 (5個號碼)</div>
                      <div className="text-sm text-blue-600">20% 獎池</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {round.prizes.tier2.toLocaleString()} SUI
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-green-700">三獎 (4個號碼)</div>
                      <div className="text-sm text-green-600">10% 獎池</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {round.prizes.tier3.toLocaleString()} SUI
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">歷史輪次</h1>
          <p className="text-gray-600">查看過往期數的開獎結果和獎金分配</p>
        </div>

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">總輪次數</div>
            <div className="text-3xl font-bold text-gray-900">{mockHistoryRounds.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6">
            <div className="text-sm text-purple-700 mb-2">總獎池累計</div>
            <div className="text-3xl font-bold text-purple-600">
              {mockHistoryRounds.reduce((sum, r) => sum + r.prize_pool, 0).toLocaleString()} SUI
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-green-700 mb-2">總售票數</div>
            <div className="text-3xl font-bold text-green-600">
              {mockHistoryRounds.reduce((sum, r) => sum + r.total_tickets_sold, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 歷史輪次列表 */}
        <div className="space-y-4">
          {mockHistoryRounds.map((round) => (
            <RoundCard key={round.round_id} round={round} />
          ))}
        </div>

        {/* 空狀態 */}
        {mockHistoryRounds.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">暫無歷史記錄</h3>
            <p className="text-gray-600">目前還沒有已結束的輪次</p>
          </div>
        )}
      </div>

      {/* 詳情彈窗 */}
      {selectedRound && <RoundDetailModal round={selectedRound} />}
    </div>
  );
}
