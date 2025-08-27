# SuiPot Lotto Frontend

基於 Sui 區塊鏈的去中心化彩票遊戲前端應用。

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **區塊鏈**: Sui blockchain
- **錢包**: @mysten/dapp-kit
- **狀態管理**: React Query
- **UI 組件**: Headless UI, Framer Motion

## 開發環境設置

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

應用將在 http://localhost:3000 運行。

### 3. 建置生產版本

```bash
npm run build
```

### 4. 檢查程式碼風格

```bash
npm run lint
```

## 項目結構

```
src/
├── app/                    # Next.js App Router 頁面
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 主頁面
│   └── globals.css         # 全域樣式
├── components/             # React 組件
│   ├── ui/                 # 基礎 UI 組件
│   │   └── Button.tsx      # 按鈕組件
│   └── Providers.tsx       # 應用程序 Provider
├── hooks/                  # 自訂 React Hooks
│   ├── useWallet.ts        # 錢包相關 hook
│   └── useLottery.ts       # 彩票邏輯 hook
├── lib/                    # 工具函數和配置
│   ├── sui.ts              # Sui 客戶端配置
│   └── utils.ts            # 通用工具函數
├── types/                  # TypeScript 類型定義
│   └── lottery.ts          # 彩票相關類型
└── constants/              # 常數定義
    └── lottery.ts          # 彩票相關常數
```

## 主要功能

### 🎯 核心功能
- **錢包連接**: 支援多種 Sui 錢包
- **購買彩票**: 選擇 6 個號碼 (1-50)
- **即時更新**: 自動刷新彩票狀態
- **倒數計時**: 顯示開獎倒數時間
- **中獎查詢**: 查看個人彩票和中獎記錄

### 🎨 UI 特色
- **響應式設計**: 支援桌面和移動設備
- **深色主題**: 現代化的深色漸變背景
- **流暢動畫**: 使用 Framer Motion
- **即時通知**: Toast 通知系統

## 部署到 Walrus Sites

### 1. 建置靜態檔案

```bash
npm run build
```

### 2. 安裝 Walrus Site Builder

```bash
# 安裝 site-builder
npm install -g @walrus-sites/site-builder
```

### 3. 部署到 Walrus

```bash
# 部署靜態檔案到 Walrus
site-builder publish out/
```

## 環境變數

創建 `.env.local` 檔案：

```env
# Sui 網路配置
NEXT_PUBLIC_SUI_NETWORK=testnet

# 合約地址 (部署後設置)
NEXT_PUBLIC_LOTTERY_PACKAGE_ID=0x...
```

## 開發指南

### 添加新功能

1. **新增類型**: 在 `src/types/lottery.ts` 中定義
2. **新增常數**: 在 `src/constants/lottery.ts` 中定義
3. **實作邏輯**: 在 `src/hooks/` 中創建 hook
4. **建立組件**: 在 `src/components/` 中創建組件
5. **更新頁面**: 在 `src/app/` 中使用組件

### 程式碼風格

- 使用 TypeScript 進行類型安全
- 遵循 ESLint 和 Prettier 規則
- 使用 Tailwind CSS 進行樣式設計
- 組件使用 PascalCase 命名
- Hook 使用 camelCase 命名，以 `use` 開頭

## 待辦事項

- [ ] 實作 Move 合約整合
- [ ] 添加多語言支援
- [ ] 優化移動端體驗
- [ ] 添加單元測試
- [ ] 實作分析和監控
- [ ] 添加 PWA 支援

## 授權

MIT License
