import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'react-hot-toast';
import { WalletInfo, TransactionResult } from '@/types/lottery';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/lottery';

export const useWallet = (): WalletInfo & {
  signAndExecute: (tx: Transaction) => Promise<TransactionResult>;
} => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // 查詢 SUI 餘額
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address ?? '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  const executeTransaction = async (tx: Transaction): Promise<TransactionResult> => {
    return new Promise((resolve) => {
      if (!currentAccount) {
        toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
        resolve({ success: false, error: ERROR_MESSAGES.WALLET_NOT_CONNECTED });
        return;
      }

      signAndExecute(
        {
          transaction: tx,
          account: currentAccount,
        },
        {
          onSuccess: (result) => {
            toast.success(SUCCESS_MESSAGES.TRANSACTION_CONFIRMED);
            resolve({ 
              success: true, 
              digest: result.digest 
            });
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast.error(ERROR_MESSAGES.TRANSACTION_FAILED);
            resolve({ 
              success: false, 
              error: error.message || ERROR_MESSAGES.TRANSACTION_FAILED 
            });
          },
        }
      );
    });
  };

  const suiBalance = balance ? parseInt(balance.totalBalance) / 1_000_000_000 : 0;

  return {
    address: currentAccount?.address || null,
    balance: suiBalance,
    isConnected: !!currentAccount,
    signAndExecute: executeTransaction,
  };
};

// 餘額查詢 Hook
export const useBalance = (address: string | null) => {
  const { data: balance, isLoading, error, refetch } = useSuiClientQuery(
    'getBalance',
    {
      owner: address ?? '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!address,
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  const suiBalance = balance ? parseInt(balance.totalBalance) / 1_000_000_000 : 0;
  
  return {
    balance: suiBalance,
    isLoading,
    error,
    refetch,
  };
};
