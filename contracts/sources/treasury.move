/// 金庫管理模組 - 管理平台費用和 rollover 資金
module suipot_lotto::treasury {
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::tx_context::{TxContext};
    use sui::coin::{Self, Coin};
    use sui::event;

    /// 金庫對象
    public struct Treasury has key {
        id: UID,
        /// 平台手續費餘額
        fees_balance: Balance<SUI>,
        /// Rollover 暫存餘額（空獎級獎金）
        rollover_balance: Balance<SUI>,
        /// 累計收取的手續費總額
        total_fees_collected: u64,
        /// 累計提領的手續費總額
        total_fees_withdrawn: u64,
        /// 累計 rollover 金額
        total_rollover_amount: u64,
    }

    /// 管理員權限
    public struct AdminCap has key {
        id: UID,
    }

    /// 事件：手續費收集
    public struct FeeCollected has copy, drop {
        round_id: vector<u8>,
        amount: u64,
    }

    /// 事件：手續費提領
    public struct FeeWithdrawn has copy, drop {
        operator: address,
        amount: u64,
        timestamp: u64,
    }

    /// 事件：Rollover 添加
    public struct RolloverAdded has copy, drop {
        from_round_id: vector<u8>,
        to_round_id: vector<u8>,
        amount: u64,
    }

    /// 錯誤碼
    const EInsufficientBalance: u64 = 1;
    const EInvalidAmount: u64 = 2;

    /// 初始化金庫（在模組發佈時調用）
    fun init(ctx: &mut TxContext) {
        // 創建金庫
        let treasury = Treasury {
            id: object::new(ctx),
            fees_balance: balance::zero(),
            rollover_balance: balance::zero(),
            total_fees_collected: 0,
            total_fees_withdrawn: 0,
            total_rollover_amount: 0,
        };

        // 創建管理員權限
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        // 轉移金庫和管理員權限給發佈者
        transfer::share_object(treasury);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// 收集手續費
    public(package) fun collect_fees(
        treasury: &mut Treasury,
        round_id: vector<u8>,
        fees: Coin<SUI>
    ) {
        let amount = coin::value(&fees);
        let fees_balance = coin::into_balance(fees);

        balance::join(&mut treasury.fees_balance, fees_balance);
        treasury.total_fees_collected = treasury.total_fees_collected + amount;

        event::emit(FeeCollected {
            round_id,
            amount,
        });
    }

    /// 提領手續費（僅管理員）
    public fun withdraw_fees(
        _admin_cap: &AdminCap,
        treasury: &mut Treasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(amount > 0, EInvalidAmount);
        assert!(
            balance::value(&treasury.fees_balance) >= amount,
            EInsufficientBalance
        );

        let withdrawn_balance = balance::split(&mut treasury.fees_balance, amount);
        treasury.total_fees_withdrawn = treasury.total_fees_withdrawn + amount;

        event::emit(FeeWithdrawn {
            operator: tx_context::sender(ctx),
            amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        coin::from_balance(withdrawn_balance, ctx)
    }

    /// 添加 Rollover 資金
    public(package) fun add_rollover(
        treasury: &mut Treasury,
        from_round_id: vector<u8>,
        to_round_id: vector<u8>,
        amount: Coin<SUI>
    ) {
        let rollover_amount = coin::value(&amount);
        let rollover_balance = coin::into_balance(amount);

        balance::join(&mut treasury.rollover_balance, rollover_balance);
        treasury.total_rollover_amount = treasury.total_rollover_amount + rollover_amount;

        event::emit(RolloverAdded {
            from_round_id,
            to_round_id,
            amount: rollover_amount,
        });
    }

    /// 提取 Rollover 資金用於下一輪
    public(package) fun withdraw_rollover(
        treasury: &mut Treasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(amount > 0, EInvalidAmount);
        assert!(
            balance::value(&treasury.rollover_balance) >= amount,
            EInsufficientBalance
        );

        let rollover_balance = balance::split(&mut treasury.rollover_balance, amount);
        coin::from_balance(rollover_balance, ctx)
    }

    // === Getter 函數 ===

    public fun get_fees_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.fees_balance)
    }

    public fun get_rollover_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.rollover_balance)
    }

    public fun get_total_fees_collected(treasury: &Treasury): u64 {
        treasury.total_fees_collected
    }

    public fun get_total_fees_withdrawn(treasury: &Treasury): u64 {
        treasury.total_fees_withdrawn
    }

    public fun get_total_rollover_amount(treasury: &Treasury): u64 {
        treasury.total_rollover_amount
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
