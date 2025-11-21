/// SuiPot Lotto 核心合約
/// 管理樂透週期、購票、開獎、獎金分配等所有核心功能
module suipot_lotto::lottopot {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::random::{Random};
    use std::vector;
    use std::string::{Self, String};
    use suipot_lotto::ticket::{Self, Ticket};
    use suipot_lotto::random as lottery_random;
    use suipot_lotto::treasury::{Self, Treasury};

    /// 輪次狀態
    const STATUS_OPEN: u8 = 1;
    const STATUS_DRAWING: u8 = 2;
    const STATUS_CLOSED: u8 = 3;

    /// 獎金分配比例（基於 10000）
    const TIER1_PERCENTAGE: u64 = 6500;  // 65%
    const TIER2_PERCENTAGE: u64 = 2000;  // 20%
    const TIER3_PERCENTAGE: u64 = 1000;  // 10%
    const FEE_PERCENTAGE: u64 = 500;     // 5%
    const PERCENTAGE_BASE: u64 = 10000;

    /// 領獎期限（90 天，以毫秒計）
    const CLAIM_PERIOD_MS: u64 = 90 * 24 * 60 * 60 * 1000;

    /// 最大輪期長度（14 天）
    const MAX_ROUND_DURATION_MS: u64 = 14 * 24 * 60 * 60 * 1000;

    /// 錯誤碼
    const EInvalidStatus: u64 = 1;
    const ERoundNotEnded: u64 = 2;
    const ERoundEnded: u64 = 3;
    const EInvalidTicketCount: u64 = 4;
    const EInsufficientPayment: u64 = 5;
    const ENotPaused: u64 = 6;
    const EPaused: u64 = 7;
    const EInvalidDuration: u64 = 8;
    const EInvalidFeeRate: u64 = 9;
    const EClaimExpired: u64 = 10;
    const ENotWinning: u64 = 11;

    /// 樂透輪次
    public struct LotteryRound has key, store {
        id: UID,
        /// 輪次 ID（字符串）
        round_id: String,
        /// 輪次編號
        round_number: u64,
        /// 代幣類型（目前僅支持 SUI）
        token_type: String,
        /// 單張彩券價格
        ticket_price: u64,
        /// 開始時間戳
        start_time: u64,
        /// 結束時間戳
        end_time: u64,
        /// 開獎時間戳
        draw_time: u64,
        /// 狀態
        status: u8,
        /// 已售彩券數
        total_tickets_sold: u64,
        /// 獎金池餘額
        prize_pool: Balance<SUI>,
        /// 中獎號碼（開獎後設置）
        winning_numbers: vector<u8>,
        /// 各獎級中獎人數
        tier1_winners: u64,
        tier2_winners: u64,
        tier3_winners: u64,
        /// 各獎級獎金分配
        tier1_prize: u64,
        tier2_prize: u64,
        tier3_prize: u64,
        /// 領獎截止時間
        claim_deadline: u64,
    }

    /// 系統配置
    public struct SystemConfig has key {
        id: UID,
        /// 當前輪次編號
        current_round_number: u64,
        /// 是否暫停
        paused: bool,
        /// 手續費比例（基於 10000）
        fee_rate: u64,
        /// 最大輪期長度（毫秒）
        max_round_duration: u64,
        /// 單交易最大購票數
        max_tickets_per_tx: u64,
        /// 輪次表
        rounds: Table<u64, address>,
    }

    /// 管理員權限
    public struct AdminCap has key {
        id: UID,
    }

    /// 事件：輪次創建
    public struct RoundCreated has copy, drop {
        round_id: String,
        round_number: u64,
        token: String,
        ticket_price: u64,
        start_time: u64,
        end_time: u64,
    }

    /// 事件：彩券購買
    public struct TicketPurchased has copy, drop {
        round_id: String,
        buyer: address,
        quantity: u64,
        total_cost: u64,
    }

    /// 事件：輪次開獎
    public struct RoundDrawn has copy, drop {
        round_id: String,
        winning_numbers: vector<u8>,
        tier1_winners: u64,
        tier2_winners: u64,
        tier3_winners: u64,
    }

    /// 事件：獎金領取
    public struct PrizeClaimed has copy, drop {
        round_id: String,
        claimer: address,
        tier: u8,
        amount: u64,
    }

    /// 事件：逾期未領回收
    public struct UnclaimedRolled has copy, drop {
        from_round_id: String,
        amount: u64,
        timestamp: u64,
    }

    /// 事件：系統暫停狀態變更
    public struct PauseStatusChanged has copy, drop {
        paused: bool,
        timestamp: u64,
    }

    /// 初始化函數
    fun init(ctx: &mut TxContext) {
        let config = SystemConfig {
            id: object::new(ctx),
            current_round_number: 0,
            paused: false,
            fee_rate: FEE_PERCENTAGE,
            max_round_duration: MAX_ROUND_DURATION_MS,
            max_tickets_per_tx: 50,
            rounds: table::new(ctx),
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(config);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// 創建新輪次
    public fun create_round(
        _admin_cap: &AdminCap,
        config: &mut SystemConfig,
        ticket_price: u64,
        duration_ms: u64,
        ctx: &mut TxContext
    ): address {
        assert!(!config.paused, EPaused);
        assert!(duration_ms <= config.max_round_duration, EInvalidDuration);

        let round_number = config.current_round_number + 1;
        let round_id = create_round_id(round_number);
        let now = tx_context::epoch_timestamp_ms(ctx);
        let end_time = now + duration_ms;

        let round = LotteryRound {
            id: object::new(ctx),
            round_id,
            round_number,
            token_type: string::utf8(b"SUI"),
            ticket_price,
            start_time: now,
            end_time,
            draw_time: 0,
            status: STATUS_OPEN,
            total_tickets_sold: 0,
            prize_pool: balance::zero(),
            winning_numbers: vector::empty(),
            tier1_winners: 0,
            tier2_winners: 0,
            tier3_winners: 0,
            tier1_prize: 0,
            tier2_prize: 0,
            tier3_prize: 0,
            claim_deadline: 0,
        };

        event::emit(RoundCreated {
            round_id,
            round_number,
            token: string::utf8(b"SUI"),
            ticket_price,
            start_time: now,
            end_time,
        });

        config.current_round_number = round_number;
        let round_addr = object::id_address(&round);
        table::add(&mut config.rounds, round_number, round_addr);

        transfer::share_object(round);
        round_addr
    }

    /// 購買彩券（批量）
    public fun purchase_tickets(
        round: &mut LotteryRound,
        config: &SystemConfig,
        treasury: &mut Treasury,
        number_sets: vector<vector<u8>>,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(!config.paused, EPaused);
        assert!(round.status == STATUS_OPEN, EInvalidStatus);

        let now = tx_context::epoch_timestamp_ms(ctx);
        assert!(now < round.end_time, ERoundEnded);

        let quantity = vector::length(&number_sets);
        assert!(quantity > 0 && quantity <= config.max_tickets_per_tx, EInvalidTicketCount);

        // 計算總價和手續費
        let total_cost = round.ticket_price * quantity;
        assert!(coin::value(&payment) >= total_cost, EInsufficientPayment);

        let fee_amount = (total_cost * config.fee_rate) / PERCENTAGE_BASE;
        let prize_amount = total_cost - fee_amount;

        // 分配資金
        let payment_balance = coin::into_balance(payment);
        let fee_balance = balance::split(&mut payment_balance, fee_amount);
        let prize_balance = payment_balance;

        // 收集手續費
        treasury::collect_fees(
            treasury,
            *string::bytes(&round.round_id),
            coin::from_balance(fee_balance, ctx)
        );

        // 添加到獎金池
        balance::join(&mut round.prize_pool, prize_balance);

        // 鑄造彩券
        let buyer = tx_context::sender(ctx);
        let i = 0;
        while (i < quantity) {
            let numbers = *vector::borrow(&number_sets, i);
            let ticket_number = round.total_tickets_sold + i + 1;

            let ticket = ticket::create_ticket(
                *string::bytes(&round.round_id),
                ticket_number,
                numbers,
                now,
                ctx
            );

            ticket::transfer_ticket(ticket, buyer);
            i = i + 1;
        };

        round.total_tickets_sold = round.total_tickets_sold + quantity;

        event::emit(TicketPurchased {
            round_id: round.round_id,
            buyer,
            quantity,
            total_cost,
        });
    }

    /// 手動開獎
    public fun manual_draw(
        _admin_cap: &AdminCap,
        round: &mut LotteryRound,
        config: &SystemConfig,
        r: &Random,
        ctx: &mut TxContext
    ) {
        assert!(!config.paused, EPaused);
        assert!(round.status == STATUS_OPEN, EInvalidStatus);

        let now = tx_context::epoch_timestamp_ms(ctx);
        assert!(now >= round.end_time, ERoundNotEnded);

        // 生成中獎號碼
        let winning_numbers = lottery_random::generate_winning_numbers(r, ctx);
        round.winning_numbers = winning_numbers;
        round.draw_time = now;
        round.status = STATUS_CLOSED;
        round.claim_deadline = now + CLAIM_PERIOD_MS;

        // 計算獎金分配
        let total_prize = balance::value(&round.prize_pool);
        round.tier1_prize = (total_prize * TIER1_PERCENTAGE) / PERCENTAGE_BASE;
        round.tier2_prize = (total_prize * TIER2_PERCENTAGE) / PERCENTAGE_BASE;
        round.tier3_prize = (total_prize * TIER3_PERCENTAGE) / PERCENTAGE_BASE;

        event::emit(RoundDrawn {
            round_id: round.round_id,
            winning_numbers,
            tier1_winners: 0,
            tier2_winners: 0,
            tier3_winners: 0,
        });
    }

    /// 領取獎金
    public fun claim_prize(
        round: &mut LotteryRound,
        config: &SystemConfig,
        ticket: &mut Ticket,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(!config.paused, EPaused);
        assert!(round.status == STATUS_CLOSED, EInvalidStatus);

        let now = tx_context::epoch_timestamp_ms(ctx);
        assert!(now <= round.claim_deadline, EClaimExpired);

        // 檢查彩券是否屬於此輪次
        let ticket_round_id = ticket::get_round_id(ticket);
        assert!(ticket_round_id == *string::bytes(&round.round_id), 0);

        // 計算匹配數
        let matches = ticket::count_matches(
            &ticket::get_numbers(ticket),
            &round.winning_numbers
        );

        // 確定獎級並計算獎金
        let (tier, prize_amount) = if (matches == 6) {
            // 頭獎
            round.tier1_winners = round.tier1_winners + 1;
            let amount = round.tier1_prize / round.tier1_winners;
            (1u8, amount)
        } else if (matches == 5) {
            // 二獎
            round.tier2_winners = round.tier2_winners + 1;
            let amount = round.tier2_prize / round.tier2_winners;
            (2u8, amount)
        } else if (matches == 4) {
            // 三獎
            round.tier3_winners = round.tier3_winners + 1;
            let amount = round.tier3_prize / round.tier3_winners;
            (3u8, amount)
        } else {
            abort ENotWinning
        };

        // 更新彩券狀態
        ticket::set_winning_tier(ticket, tier);
        ticket::mark_claimed(ticket);

        // 轉移獎金
        let prize_balance = balance::split(&mut round.prize_pool, prize_amount);
        let prize_coin = coin::from_balance(prize_balance, ctx);

        event::emit(PrizeClaimed {
            round_id: round.round_id,
            claimer: tx_context::sender(ctx),
            tier,
            amount: prize_amount,
        });

        prize_coin
    }

    /// 暫停系統
    public fun pause(_admin_cap: &AdminCap, config: &mut SystemConfig, ctx: &mut TxContext) {
        assert!(!config.paused, 0);
        config.paused = true;

        event::emit(PauseStatusChanged {
            paused: true,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// 恢復系統
    public fun resume(_admin_cap: &AdminCap, config: &mut SystemConfig, ctx: &mut TxContext) {
        assert!(config.paused, ENotPaused);
        config.paused = false;

        event::emit(PauseStatusChanged {
            paused: false,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// 更新手續費比例
    public fun update_fee_rate(
        _admin_cap: &AdminCap,
        config: &mut SystemConfig,
        new_rate: u64
    ) {
        assert!(new_rate <= 1000, EInvalidFeeRate); // 最高 10%
        config.fee_rate = new_rate;
    }

    // === 輔助函數 ===

    fun create_round_id(round_number: u64): String {
        let prefix = b"round_";
        let mut id_bytes = prefix;

        // 將數字轉為字節（簡化版本）
        let mut num = round_number;
        let mut num_bytes = vector::empty<u8>();

        if (num == 0) {
            vector::push_back(&mut num_bytes, 48); // '0'
        } else {
            while (num > 0) {
                let digit = ((num % 10) as u8) + 48;
                vector::push_back(&mut num_bytes, digit);
                num = num / 10;
            };
            vector::reverse(&mut num_bytes);
        };

        vector::append(&mut id_bytes, num_bytes);
        string::utf8(id_bytes)
    }

    // === Getter 函數 ===

    public fun get_round_id(round: &LotteryRound): String {
        round.round_id
    }

    public fun get_round_number(round: &LotteryRound): u64 {
        round.round_number
    }

    public fun get_status(round: &LotteryRound): u8 {
        round.status
    }

    public fun get_prize_pool(round: &LotteryRound): u64 {
        balance::value(&round.prize_pool)
    }

    public fun get_total_tickets_sold(round: &LotteryRound): u64 {
        round.total_tickets_sold
    }

    public fun get_winning_numbers(round: &LotteryRound): vector<u8> {
        round.winning_numbers
    }

    public fun is_paused(config: &SystemConfig): bool {
        config.paused
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
