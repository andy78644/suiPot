'use client';

import React, { useState } from 'react';
import { 
  useCurrentAccount, 
  useConnectWallet, 
  useDisconnectWallet,
  useWallets 
} from '@mysten/dapp-kit';
import Button from '@/components/ui/Button';
import { formatSuiAddress } from '@/lib/utils';

export function ConnectWalletButton() {
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const [showWallets, setShowWallets] = useState(false);

  if (currentAccount) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">已連接</span>
        </div>
        <div className="text-sm text-gray-600 font-mono">
          {formatSuiAddress(currentAccount.address)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          斷開連接
        </Button>
      </div>
    );
  }

  if (showWallets) {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-48">
          <div className="text-sm font-medium text-gray-700 mb-2 px-2">選擇錢包</div>
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => {
                connect({ wallet });
                setShowWallets(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
              <span className="text-sm">{wallet.name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowWallets(false)}
            className="w-full text-center text-xs text-gray-500 mt-2 py-1 hover:text-gray-700"
          >
            取消
          </button>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowWallets(false)}
        >
          選擇錢包
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowWallets(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      連接錢包
    </Button>
  );
}
