# SuiPot Lotto 智能合約

基於 Sui 區塊鏈的去中心化樂透系統智能合約。

## 📁 項目結構

```
contracts/
├── sources/              # 源代碼
│   ├── lottopot.move    # 核心樂透合約
│   ├── ticket.move      # 彩券對象管理
│   ├── random.move      # 隨機數生成
│   └── treasury.move    # 金庫管理
├── tests/               # 測試文件
│   ├── ticket_tests.move
│   ├── lottopot_tests.move
│   ├── treasury_tests.move
│   └── integration_tests.move
└── Move.toml            # Move 配置文件
```

## 🔧 模組說明

### lottopot.move
核心樂透合約，實現：
- 樂透週期管理（創建、狀態轉換）
- 批量購票功能（最多 50 張）
- 手動開獎機制
- 獎金分配（65%/20%/10% + 5% 手續費）
- 領獎功能
- 系統暫停/恢復
- 參數配置

### ticket.move
彩券對象管理，實現：
- 彩券創建和驗證
- 號碼格式驗證（6 個不重複，1-50）
- 中獎匹配計算
- 領獎狀態管理

### random.move
隨機數生成模組，實現：
- 封裝 Sui Random 功能
- 生成不重複的隨機號碼
- 測試用模擬數據

### treasury.move
金庫管理模組，實現：
- 手續費收集和管理
- Rollover 資金管理
- 管理員提領功能
- 完整的事件日誌

## 🧪 運行測試

### 前置要求
- 安裝 Sui CLI（版本 >= 1.0）

### 編譯合約
```bash
sui move build
```

### 運行所有測試
```bash
sui move test
```

### 運行特定測試模組
```bash
# 測試彩券模組
sui move test ticket_tests

# 測試核心樂透模組
sui move test lottopot_tests

# 測試金庫模組
sui move test treasury_tests

# 測試集成流程
sui move test integration_tests
```

### 運行特定測試函數
```bash
sui move test test_create_valid_ticket
```

### 查看測試覆蓋率
```bash
sui move test --coverage
```

## 📊 測試覆蓋範圍

### ticket_tests.move
- ✅ 創建有效彩券
- ✅ 無效號碼數量
- ✅ 號碼範圍驗證
- ✅ 重複號碼檢測
- ✅ 匹配計算（全中/部分/無）
- ✅ 中獎等級設置
- ✅ 領獎流程
- ✅ 重複領獎防護

### lottopot_tests.move
- ✅ 創建輪次
- ✅ 購買彩券
- ✅ 批量購票限制
- ✅ 支付金額驗證
- ✅ 系統暫停/恢復
- ✅ 暫停時禁止操作
- ✅ 手續費比例更新
- ✅ 參數驗證

### treasury_tests.move
- ✅ 手續費收集
- ✅ 多次手續費收集
- ✅ 手續費提領
- ✅ 餘額不足保護
- ✅ 無效金額檢查
- ✅ Rollover 添加
- ✅ Rollover 提取
- ✅ 複合操作測試

### integration_tests.move
- ✅ 完整樂透流程（創建→購票→驗證→提領）
- ✅ 暫停恢復流程
- ✅ 批量購買最大數量（50 張）

## 🚀 部署合約

### 1. 設置 Sui 錢包
```bash
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

### 2. 發佈合約
```bash
sui client publish --gas-budget 100000000
```

### 3. 記錄重要信息
發佈成功後，記錄以下信息：
- Package ID
- AdminCap Object ID（lottopot 和 treasury 各一個）
- SystemConfig Object ID
- Treasury Object ID

## 📝 使用示例

### 創建輪次（管理員）
```rust
public fun create_round(
    admin_cap: &AdminCap,
    config: &mut SystemConfig,
    ticket_price: u64,      // 例如：1_000_000_000 (1 SUI)
    duration_ms: u64,       // 例如：7 * 24 * 60 * 60 * 1000 (7天)
    ctx: &mut TxContext
)
```

### 購買彩券（用戶）
```rust
public fun purchase_tickets(
    round: &mut LotteryRound,
    config: &SystemConfig,
    treasury: &mut Treasury,
    number_sets: vector<vector<u8>>,  // 例如：[[1,10,20,30,40,50], [2,11,21,31,41,49]]
    payment: Coin<SUI>,
    ctx: &mut TxContext
)
```

### 手動開獎（管理員）
```rust
public fun manual_draw(
    admin_cap: &AdminCap,
    round: &mut LotteryRound,
    config: &SystemConfig,
    r: &Random,
    ctx: &mut TxContext
)
```

### 領取獎金（用戶）
```rust
public fun claim_prize(
    round: &mut LotteryRound,
    config: &SystemConfig,
    ticket: &mut Ticket,
    ctx: &mut TxContext
): Coin<SUI>
```

## ⚙️ 配置參數

- **手續費比例**: 5%（可調整，最高 10%）
- **最大輪期長度**: 14 天
- **單次最大購票數**: 50 張
- **領獎期限**: 90 天
- **獎金分配**:
  - 頭獎（6 中）: 65%
  - 二獎（5 中）: 20%
  - 三獎（4 中）: 10%
  - 平台手續費: 5%

## 🔒 安全特性

- ✅ 防重入攻擊
- ✅ 整數溢位保護
- ✅ 權限控制（AdminCap）
- ✅ 狀態鎖定機制
- ✅ 金額驗證
- ✅ 暫停機制
- ✅ 領獎期限控制

## 📄 許可證

本項目為黑客松項目，遵循相關開源協議。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯繫方式

如有問題，請在 GitHub 上提交 Issue。
