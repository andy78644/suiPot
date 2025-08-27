# SuiPot Lotto 前端設計文件

**版本**：1.0  
**日期**：2025年8月27日  
**作者**：黑客松獵人團隊  
**部署平台**：Walrus Sites (wal.app)

---

## 1. 專案概述

### 1.1 前端目標

基於 PRD 需求，構建一個直觀、響應式的去中心化樂透 dApp 前端，提供完整的使用者體驗，包括錢包連接、彩券購買、開獎查看、獎金領取等核心功能。

### 1.2 部署策略

- **主要部署**：Walrus Sites (去中心化存儲)
- **備用部署**：Vercel (開發測試)
- **靜態網站生成**：Next.js SSG 模式，確保與 Walrus Sites 兼容

---

## 2. 技術架構

### 2.1 核心技術棧

#### 前端框架

- **React 18** + **Next.js 14** (App Router)
- **TypeScript** (強型別支援)
- **Tailwind CSS** (樣式系統)

#### Sui 生態整合

- **@mysten/sui.js** (Sui SDK)
- **@mysten/dapp-kit** (錢包連接與交易)
- **@suiet/wallet-kit** (備用錢包方案)

#### UI/UX 組件

- **Headless UI** (無樣式組件)
- **React Hook Form** (表單管理)
- **Framer Motion** (動畫效果)
- **React Query (TanStack Query)** (狀態管理與快取)

#### 開發工具

- **ESLint** + **Prettier** (代碼規範)
- **Husky** (Git Hooks)
- **Jest** + **React Testing Library** (測試)

### 2.2 專案結構

```text
src/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx           # 主頁
│   ├── lottery/
│   │   ├── [id]/page.tsx  # 特定樂透輪詳情
│   │   └── history/page.tsx
│   ├── my-tickets/page.tsx
│   └── admin/page.tsx
├── components/            # React 組件
│   ├── ui/               # 基礎 UI 組件
│   ├── wallet/           # 錢包相關
│   ├── lottery/          # 樂透相關
│   └── layout/           # 布局組件
├── hooks/                # 自定義 Hooks
├── lib/                  # 工具庫
│   ├── sui.ts           # Sui 客戶端設定
│   ├── contracts.ts     # 合約交互
│   └── utils.ts         # 工具函數
├── types/                # TypeScript 類型
└── constants/            # 常數定義
```

### 2.3 Walrus Sites 部署配置

#### Next.js 配置 (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // 靜態導出
  trailingSlash: true,        // Walrus Sites 需求
  images: {
    unoptimized: true         // 靜態部署需求
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  basePath: '',
  generateBuildId: () => 'build'
}

module.exports = nextConfig
```

#### 部署腳本 (package.json)

```json
{
  "scripts": {
    "build:walrus": "next build && touch out/.nojekyll",
    "deploy:walrus": "site-builder --config ~/.config/walrus/sites-config.yaml publish out",
    "deploy:update": "site-builder --config ~/.config/walrus/sites-config.yaml update out"
  }
}
```

---

## 3. 核心功能設計

### 3.1 錢包連接模組

#### 組件：WalletConnection

- **功能**：支援 Sui Wallet、Suiet、Martian 等主流錢包
- **狀態管理**：連接狀態、帳戶地址、餘額
- **用戶體驗**：一鍵連接、自動重連、錯誤處理

```typescript
// hooks/useWallet.ts
export const useWallet = () => {
  const { currentAccount, signAndExecuteTransactionBlock } = useCurrentAccount()
  const { mutate: connect } = useConnectWallet()
  
  return {
    address: currentAccount?.address,
    isConnected: !!currentAccount,
    connect,
    signTransaction: signAndExecuteTransactionBlock
  }
}
```

### 3.2 樂透列表與詳情

#### 組件：LotteryDashboard

- **當前開放輪次**：倒數計時、獎池金額、售票數量
- **歷史輪次**：中獎號碼、獎金分配記錄
- **實時更新**：WebSocket 或輪詢更新狀態

#### 組件：LotteryDetail

- **輪次資訊**：round_id、代幣類型、開獎狀態
- **購票區域**：號碼選擇器、批量購買
- **統計資料**：參與人數、獎池分配預覽

### 3.3 號碼選擇與購票

#### 組件：NumberPicker

- **交互設計**：6 個號碼選擇 (1-50)
- **驗證邏輯**：重複檢查、範圍驗證
- **快速選號**：隨機生成、歷史號碼

#### 組件：TicketPurchase

- **批量購買**：最多 50 張/交易
- **費用計算**：票價 × 數量 + gas 估算
- **交易確認**：簽名前預覽、錯誤處理

```typescript
// components/lottery/TicketPurchase.tsx
export const TicketPurchase = ({ roundId }: { roundId: string }) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[][]>([])
  const { signTransaction } = useWallet()
  
  const handlePurchase = async () => {
    const tx = await buildPurchaseTransaction(roundId, selectedNumbers)
    await signTransaction(tx)
  }
  
  return (
    <div className="space-y-4">
      <NumberPicker onSelect={setSelectedNumbers} />
      <PurchaseSummary numbers={selectedNumbers} />
      <Button onClick={handlePurchase}>購買彩券</Button>
    </div>
  )
}
```

### 3.4 我的彩券管理

#### 組件：MyTickets

- **彩券列表**：按輪次分組顯示
- **狀態標示**：未開獎、中獎、已領獎、逾期
- **批量操作**：多選領獎、篩選功能

#### 組件：ClaimPrizes

- **自動檢測**：掃描可領獎彩券
- **批量領獎**：一次交易領取多個獎項
- **領獎記錄**：歷史領獎查詢

### 3.5 管理後台 (Admin)

#### 組件：AdminDashboard

- **輪次管理**：創建新輪、手動開獎
- **系統監控**：健康檢查、待開獎列表
- **費用管理**：手續費提取、財務報表

---

## 4. 用戶體驗設計

### 4.1 響應式設計

#### 斷點策略

- **Mobile**: < 640px (單欄布局)
- **Tablet**: 640px - 1024px (雙欄布局)  
- **Desktop**: > 1024px (三欄布局)

#### 關鍵頁面適配

- **首頁**：輪播獎池、快速購票入口
- **購票頁**：數字選擇器適配、觸控優化
- **我的彩券**：卡片式布局、滑動操作

### 4.2 互動設計

#### 微交互

- **號碼選擇**：點擊動畫、選中狀態
- **倒數計時**：動態更新、視覺提醒
- **交易狀態**：Loading、成功、失敗動畫

#### 反饋機制

- **即時驗證**：表單輸入即時檢查
- **交易進度**：詳細步驟指示
- **錯誤處理**：友善錯誤訊息、建議操作

### 4.3 無障礙設計

- **語義化 HTML**：正確使用標籤
- **鍵盤導航**：Tab 順序、快捷鍵
- **螢幕閱讀器**：ARIA 標籤、描述文字
- **色彩對比**：WCAG 2.1 AA 標準

---

## 5. 狀態管理

### 5.1 全域狀態

#### React Query 快取策略

```typescript
// lib/queries.ts
export const useLotteryRounds = () => {
  return useQuery({
    queryKey: ['lottery-rounds'],
    queryFn: fetchLotteryRounds,
    staleTime: 30000,      // 30秒後標記為過期
    refetchInterval: 60000  // 每分鐘重新獲取
  })
}

export const useMyTickets = (address: string) => {
  return useQuery({
    queryKey: ['my-tickets', address],
    queryFn: () => fetchUserTickets(address),
    enabled: !!address
  })
}
```

#### 局部狀態管理

- **useState**：組件內部狀態
- **useReducer**：複雜狀態邏輯  
- **Context**：跨組件共享 (錢包狀態)

### 5.2 資料流

```text
Sui 區塊鏈 ← 
    ↓ (RPC 查詢)
React Query 快取 ←
    ↓ (狀態訂閱)  
React 組件 ←
    ↓ (用戶操作)
Sui SDK ← 
    ↓ (交易簽名)
錢包插件
```

---

## 6. 安全考量

### 6.1 前端安全

#### 輸入驗證

- **號碼範圍**：1-50 限制
- **購票數量**：1-50 張限制
- **地址格式**：Sui 地址驗證

#### 交易安全

- **預覽確認**：簽名前顯示交易詳情
- **Gas 估算**：避免交易失敗
- **錯誤處理**：網路問題、餘額不足

### 6.2 隱私保護

- **本地存儲**：僅存儲非敏感設定
- **RPC 端點**：使用官方或可信節點
- **錢包整合**：遵循最佳實踐

---

## 7. 性能優化

### 7.1 載入優化

#### 代碼分割

```typescript
// app/lottery/[id]/page.tsx
import dynamic from 'next/dynamic'

const LotteryDetail = dynamic(() => import('@/components/lottery/LotteryDetail'), {
  loading: () => <LotteryDetailSkeleton />
})
```

#### 資源優化

- **圖片**：WebP 格式、懶載入
- **字體**：子集化、預載入
- **CSS**：Critical CSS 內聯

### 7.2 運行時優化

#### React 優化

- **memo**：防止不必要重渲染
- **useMemo/useCallback**：重計算優化
- **Suspense**：漸進式載入

#### 網路優化

- **請求去重**：React Query 自動處理
- **分頁載入**：大數據集分批獲取
- **本地快取**：減少重複請求

---

## 8. 測試策略

### 8.1 單元測試

#### 組件測試

```typescript
// __tests__/components/NumberPicker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NumberPicker } from '@/components/lottery/NumberPicker'

describe('NumberPicker', () => {
  it('should select numbers correctly', () => {
    const onSelect = jest.fn()
    render(<NumberPicker onSelect={onSelect} />)
    
    fireEvent.click(screen.getByText('1'))
    expect(onSelect).toHaveBeenCalledWith([1])
  })
})
```

#### 工具函數測試

- **合約交互**：Mock Sui SDK
- **數據處理**：邊界條件測試
- **驗證邏輯**：各種輸入情境

### 8.2 集成測試

#### E2E 測試 (Playwright)

- **完整流程**：連接錢包 → 購票 → 查看彩券
- **錯誤場景**：網路中斷、交易失敗
- **多設備**：手機、平板、桌面

---

## 9. 部署流程

### 9.1 Walrus Sites 部署

#### 環境準備

```bash
# 1. 安裝 Walrus CLI 和 site-builder
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-macos-arm64 -o site-builder
chmod +x site-builder
mv site-builder /usr/local/bin/

# 2. 配置 sites-config.yaml
mkdir -p ~/.config/walrus
curl https://raw.githubusercontent.com/MystenLabs/walrus-sites/refs/heads/mainnet/sites-config.yaml -o ~/.config/walrus/sites-config.yaml
```

#### 建置與部署

```bash
# 1. 建置靜態網站
npm run build:walrus

# 2. 部署到 Walrus Sites  
npm run deploy:walrus

# 3. 更新現有網站
npm run deploy:update
```

### 9.2 CI/CD 流程

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Walrus Sites

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:walrus
      - run: npm run deploy:walrus
        env:
          WALRUS_CONFIG: ${{ secrets.WALRUS_CONFIG }}
```

---

## 10. 監控與維護

### 10.1 錯誤監控

#### 前端錯誤追踪

- **Sentry**：錯誤收集與分析
- **自定義錯誤邊界**：優雅降級
- **用戶回饋**：錯誤報告機制

#### 性能監控

- **Web Vitals**：核心網頁指標
- **RUM**：真實用戶監控
- **資源載入**：網路性能分析

### 10.2 維護計畫

#### 定期更新

- **依賴更新**：每月安全更新
- **Sui SDK**：跟隨官方版本
- **瀏覽器兼容**：主流瀏覽器支援

#### 功能迭代

- **用戶反饋**：收集使用體驗
- **A/B 測試**：優化轉換率
- **新功能**：基於 PRD 後續延伸

---

## 11. 開發時程

### 11.1 第一階段 (Week 1-2)：基礎框架

- 專案初始化與 Walrus Sites 配置
- 基礎 UI 組件與布局
- 錢包連接整合

### 11.2 第二階段 (Week 3-4)：核心功能

- 樂透列表與詳情頁面
- 號碼選擇與購票功能
- 合約交互邏輯

### 11.3 第三階段 (Week 5-6)：進階功能

- 我的彩券管理
- 獎金領取功能
- 管理後台 (如需要)

### 11.4 第四階段 (Week 7-8)：測試與優化

- 全面測試與 Bug 修復
- 性能優化與 SEO
- Walrus Sites 部署與上線

---

## 12. 風險評估

### 12.1 技術風險

#### Walrus Sites 限制

- **靜態網站**：無伺服器端邏輯
- **資源限制**：檔案大小與數量限制
- **更新機制**：需要重新部署整個網站

#### 緩解措施

- **靜態生成**：預建置所有頁面
- **資源優化**：壓縮與代碼分割
- **漸進更新**：設計支援增量更新

### 12.2 用戶體驗風險

#### 錢包兼容性

- **錢包種類**：不同錢包行為差異
- **網路切換**：主網/測試網切換
- **交易失敗**：Gas 不足、網路問題

#### 應對方案

- **多錢包支援**：提供備選方案
- **錯誤處理**：詳細錯誤訊息與解決建議
- **用戶教育**：操作指南與常見問題

---

## 附錄

### A. 相關資源

- **Sui 開發文檔**：<https://docs.sui.io/>
- **Walrus Sites 指南**：<https://docs.wal.app/walrus-sites/>
- **dApp Kit 文檔**：<https://kit.sui.io/>
- **設計系統**：參考 Material Design 3

### B. 聯絡資訊

- **技術負責人**：[團隊成員]
- **設計負責人**：[團隊成員]  
- **專案經理**：[團隊成員]

---

*此文件將隨開發進度持續更新，請定期查看最新版本。*
