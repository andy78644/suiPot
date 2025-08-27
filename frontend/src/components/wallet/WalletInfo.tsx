'use client';

import React from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { formatNumber } from '@/lib/utils';

export function WalletInfo() {
  const currentAccount = useCurrentAccount();

  // 查詢 SUI 餘額
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address ?? '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!currentAccount?.address,
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  if (!currentAccount) {
    return null;
  }

  const suiBalance = balance ? parseInt(balance.totalBalance) / 1_000_000_000 : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">錢包餘額</h3>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(suiBalance)} SUI
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.739 8.89 10.5.48.07.96.07 1.44 0C17.16 26.739 21 22.55 21 17V7l-9-5z"/>
          </svg>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        地址: {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-8)}
      </div>
    </div>
  );
}
