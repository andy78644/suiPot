'use client';

import React from 'react';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                🎰 SuiPot Lotto
              </h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <a
                  href="#"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  彩票
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  我的票券
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  歷史開獎
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
