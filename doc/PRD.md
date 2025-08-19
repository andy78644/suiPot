# SuiPot Lotto 項目需求規劃書 (PRD)

**版本**：1.1  
**日期**：2025年8月19日  
**作者**：黑客松獵人團隊

---

## 1. 專案概述

### 1.1 專案名稱

SuiPot Lotto（SuiPot 樂透）

### 1.2 願景

建立在 Sui 區塊鏈上的去中心化、透明且可組合的「樂透即服務」（Lottery-as-a-Service）底層協議，透過鏈上可驗證流程與低成本執行，為 GameFi 生態提供公平、有趣且可驗證的抽獎基礎設施。

### 1.3 解決的問題

- 中心化抽獎平台缺乏透明度與可驗證性。
- 去中心化方案常受交易成本與延遲影響使用體驗。
- SuiPot Lotto 利用 Sui 的架構提供安全、透明且高效的抽獎服務。

### 1.4 目標用戶

- Sui 生態使用者（SUI 持有者）
- DeFi / GameFi 玩家
- 加密新手（被簡單直觀玩法吸引）

---

## 2. 功能性需求

### 2.1 樂透週期管理（Lottery Round Management）

- **FR-1.1 創建樂透週期**：建立新週期，包含唯一 `round_id`、開始/結束時間戳、單張彩券價格、使用代幣（SUI / USDC / BUCKET）。
- **FR-1.2 週期狀態轉換**：`Open` → `Closed`（開獎完成後即 Closed，MVP 不使用 `Drawing` 中間態）。
- **FR-1.3 獎金池管理**：每週期獨立獎金池，售票資金（扣手續費）自動累積。
- **FR-1.4 單一代幣策略（MVP）**：每期僅鎖定一種代幣；避免跨幣複雜性，後續再擴充聚合。
- **FR-1.5 參數限制**：管理員可設定最大輪期長度（≤14 天）、票價上限、手續費上限（≤10%）。

### 2.2 使用者功能（User Functions）

- **FR-2.1 連接錢包**：支援 Sui Wallet、Suiet 等常見 Sui 錢包。
- **FR-2.2 瀏覽樂透**：顯示當前開放與歷史輪：獎池金額、售出張數、倒數、代幣種類、中獎號碼（已開獎）。
- **FR-2.3 購買彩券**：
  - 選擇 6 個不重複號碼（1–50）。
  - 單交易最多 50 張（批量號碼組陣列）。
  - 成功後鑄造彩券 Object（含 round_id、序號、號碼組、擁有者）。
  - （延伸）快速隨機選號（非 MVP）。
- **FR-2.4 查看我的彩券**：列出未開獎與已開獎彩券，標示中獎 / 已領 / 逾期。
- **FR-2.5 領取獎金**：`claim(round_id, ticket_ids[])` 批量領獎；驗證匹配後一次性轉帳。
- **FR-2.6 領獎期限（MVP 修訂）**：自 `RoundDrawn` 事件時間起 90 天內可領獎；逾期未領之該獎級獎金 100% 滾入下一輪同代幣獎金池（若下一輪為不同代幣則延遲至下一次同代幣輪）。回收於購票 / 開獎 / 領獎 / 新輪初始化時懶計算（lazy evaluation），並觸發回收事件。

### 2.3 開獎機制（Drawing Mechanism）

- **FR-3.1 安全亂數生成**：採用鏈上可驗證亂數（`sui::random`），以 `round_id`、結束時間等鏈上資料組成種子，確保不可預測與可驗證。
- **FR-3.2 開獎觸發（MVP）**：無鏈上排程；管理員 / 外部 keeper bot 手動呼叫 `manual_draw(round_id)`。延伸：`list_ready_rounds()` 供輪詢；未來加任意人觸發激勵。
- **FR-3.3 公開可驗證**：亂數來源、結果與獎金分配交易皆可於 Sui Explorer 驗證。
- **FR-3.4 觸發條件**：同時滿足 (1) now > end_time；(2) 狀態為 `Open`；(3) 尚未寫入結果；狀態鎖避免併發。
- **FR-3.5 失敗重試**：失敗（gas / 暫時性錯誤）可重試；成功後狀態改為 `Closed` 並鎖定結果避免重入。

### 2.4 獎金與獎級模型（Prize & Tiers）

- **FR-4.1 號碼規則**：每張彩券 6 個不重複號碼（1–50）。
- **FR-4.2 三獎級（MVP）**：頭獎：6 中；二獎：5 中；三獎：4 中。
- **FR-4.3 獎金分配比例**：頭獎 65% / 二獎 20% / 三獎 10% / 協議手續費 5%（無中獎獎級份額進入 rollover）。
- **FR-4.4 空獎級 Rollover**：無中獎獎級份額標記為 rollover 注入下一輪同代幣獎池；如下一輪代幣不同，延遲至下一次同代幣輪。
- **FR-4.5 無人購票**：獎金池為 0，開獎即結束無 rollover；手續費為 0。
- **FR-4.6 取整規則**：分配向下取整；餘額（dust）併入頭獎（未來可配置）。

### 2.5 費用模型（Fees）

- **FR-5.1 手續費來源**：購票總額先抽平台手續費，餘額進獎金池。
- **FR-5.2 手續費比例**：預設 5%，可調但 ≤ 上限（≤10%）。
- **FR-5.3 費用去向**：進協議金庫（Treasury Object）；僅 owner 可 `withdraw_fees(to)`；觸發 `FeeWithdrawn` 事件。
- **FR-5.4 未來擴充**：多地址分潤（團隊 / DAO / 推薦人）（非 MVP）。

### 2.6 防濫用 / 風險控制（MVP）

- 單交易購票上限 50 張。
- （未來）單地址每輪總上限（MVP 不限制）。
- 禁止在 `Closed` 狀態購票。
- `pause()` / `resume()` 緊急控制（暫停時禁止購票 / 開獎 / 領獎）。

### 2.7 事件（On-chain Events）

- `RoundCreated(round_id, token, ticket_price, start_time, end_time)`
- `TicketPurchased(round_id, buyer, quantity)`
- `RoundDrawn(round_id, winning_numbers)`
- `PrizeClaimed(round_id, claimer, tier, amount)`
- `UnclaimedRolled(from_round_id, amount)`（逾期未領回收）
- `RolloverAdded(from_round_id, to_round_id, amount)`
- `FeeCollected(round_id, amount)`
- `FeeWithdrawn(operator, amount)`
- `HealthCheck(pending_round_count, timestamp)`（可選）

### 2.8 管理 / 系統功能（Admin & System）

- **FR-6.1 手動開獎**：`manual_draw(round_id)`。
- **FR-6.2 緊急暫停**：`pause()` / `resume()`；暫停時禁止購票、開獎、領獎。
- **FR-6.3 費用提領**：`withdraw_fees(to)`。
- **FR-6.4 健康檢查**：`list_ready_rounds()` 回傳已到期未開獎回合，供 keeper 輪詢。
- **FR-6.5 參數調整**：手續費比例、最大輪期長度、票價上限。
- **FR-6.6 逾期回收**：互動時懶處理逾期獎金並觸發 `UnclaimedRolled`。
- **FR-6.7 升級策略（MVP）**：不採 proxy；新版合約部署 + 遷移工具。

---

## 3. 非功能性需求

- **NFR-1 安全性**：防重入、整數溢位、未授權修改；主網前進行審計或內部嚴格測試。
- **NFR-2 透明度**：核心狀態（獎金池、結果）與事件完全鏈上可查。
- **NFR-3 性能**：批量購票（≤50）gas 在可接受範圍；支持高並發購票。
- **NFR-4 使用者體驗**：2 步驟完成購票（選號 + 確認）。
- **NFR-5 可組合性**：亂數、票務、獎金計算模組化。
- **NFR-6 可觀測性**：釋出核心事件 + 可選健康檢查；不自建 indexer。
- **NFR-7 測試**：購票、配對、獎金分配、rollover、逾期回收、費用提領測試覆蓋率 ≥70%。
- **NFR-8 Gas 成本**：單張與批量（≤50）不超區塊限制；持續優化。
- **NFR-9 可維護性**：邏輯職責拆分（開獎、匹配、分配、逾期回收）。

---

## 4. 系統架構與技術棧

### 4.1 智能合約（On-chain）

- **平台**：Sui
- **語言**：Sui Move
- **模組**：
  - `lottopot.move`：回合、購票、開獎、獎金分配、rollover。
  - `ticket.move`：彩券 Object / 驗證與索引鍵（hash of numbers）。
  - `random.move`：封裝 `sui::random`，抽象接口便於未來替換 VRF。
  - `treasury.move`：金庫、手續費、延遲 rollover 暫存（可與主模組合併）。

### 4.2 前端（Off-chain）

- **框架**：React / Next.js（TS）
- **Sui 套件**：Sui dApp Kit、`@mysten/sui.js`
- **UI**：Tailwind CSS 或 Material-UI
- **部署**：Vercel / Netlify

---

## 5. 後續延伸（非 MVP）

- 多代幣同輪聚合獎池
- 動態手續費 / 忠誠度折扣
- 推薦返佣 / 代理節點激勵
- NFT / GameFi 合作彩券皮膚
- 去中心化 keeper 激勵機制
- VRF 或跨鏈亂數來源

---

## 附註

若需我將此文件拆成 Issue / Roadmap / 簡報請告訴我。