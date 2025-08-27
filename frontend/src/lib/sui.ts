import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

// 網路配置
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
  },
});

// 創建 Sui 客戶端
export const suiClient = new SuiClient({
  url: networkConfig.testnet.url, // 默認使用測試網
});

// 導出配置
export { networkConfig, useNetworkVariable, useNetworkVariables };

// 網路相關工具函數
export const getCurrentNetwork = () => {
  return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
};

export const getExplorerUrl = (digest: string, network: 'testnet' | 'mainnet' = 'testnet') => {
  const baseUrl = network === 'testnet' 
    ? 'https://suiexplorer.com/?network=testnet'
    : 'https://suiexplorer.com/?network=mainnet';
  return `${baseUrl}&module=transaction&id=${digest}`;
};

export const formatSuiAddress = (address: string, length: number = 8) => {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatSuiAmount = (amount: number | string, decimals: number = 9) => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(4);
};
