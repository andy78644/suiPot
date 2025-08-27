'use client';

import React from 'react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { WalletInfo } from './WalletInfo';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function WalletConnector() {
  const currentAccount = useCurrentAccount();

  if (!currentAccount) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          連接錢包以開始遊戲
        </h3>
        <p className="text-gray-600 mb-4">
          請連接您的 Sui 錢包來購買彩票和查看餘額
        </p>
        <ConnectWalletButton />
      </div>
    );
  }

  return <WalletInfo />;
}
