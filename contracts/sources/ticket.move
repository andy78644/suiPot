/// 彩券模組 - 管理彩券對象
module suipot_lotto::ticket {
    use sui::object::{Self, UID};
    use sui::tx_context::{TxContext};
    use sui::transfer;
    use std::vector;

    /// 彩券對象
    public struct Ticket has key, store {
        id: UID,
        /// 所屬輪次 ID
        round_id: vector<u8>,
        /// 彩券序號（該輪次內）
        ticket_number: u64,
        /// 選擇的號碼（6 個不重複號碼，1-50）
        numbers: vector<u8>,
        /// 購買時間戳
        purchased_at: u64,
        /// 是否已領獎
        claimed: bool,
        /// 中獎等級（0 = 未中獎，1 = 頭獎，2 = 二獎，3 = 三獎）
        winning_tier: u8,
    }

    /// 錯誤碼
    const EInvalidNumberCount: u64 = 1;
    const EInvalidNumber: u64 = 2;
    const EDuplicateNumber: u64 = 3;
    const EAlreadyClaimed: u64 = 4;
    const ENotWinning: u64 = 5;

    /// 創建新彩券
    public fun create_ticket(
        round_id: vector<u8>,
        ticket_number: u64,
        numbers: vector<u8>,
        purchased_at: u64,
        ctx: &mut TxContext
    ): Ticket {
        // 驗證號碼
        validate_numbers(&numbers);

        Ticket {
            id: object::new(ctx),
            round_id,
            ticket_number,
            numbers,
            purchased_at,
            claimed: false,
            winning_tier: 0,
        }
    }

    /// 驗證號碼格式
    fun validate_numbers(numbers: &vector<u8>) {
        // 檢查數量（必須是 6 個）
        assert!(vector::length(numbers) == 6, EInvalidNumberCount);

        let i = 0;
        while (i < 6) {
            let num = *vector::borrow(numbers, i);

            // 檢查範圍（1-50）
            assert!(num >= 1 && num <= 50, EInvalidNumber);

            // 檢查是否有重複
            let j = i + 1;
            while (j < 6) {
                assert!(num != *vector::borrow(numbers, j), EDuplicateNumber);
                j = j + 1;
            };

            i = i + 1;
        };
    }

    /// 計算匹配的號碼數量
    public fun count_matches(ticket_numbers: &vector<u8>, winning_numbers: &vector<u8>): u8 {
        let matches = 0u8;
        let i = 0;

        while (i < vector::length(ticket_numbers)) {
            let num = vector::borrow(ticket_numbers, i);
            if (vector::contains(winning_numbers, num)) {
                matches = matches + 1;
            };
            i = i + 1;
        };

        matches
    }

    /// 設置中獎等級
    public(package) fun set_winning_tier(ticket: &mut Ticket, tier: u8) {
        ticket.winning_tier = tier;
    }

    /// 標記為已領獎
    public(package) fun mark_claimed(ticket: &mut Ticket) {
        assert!(!ticket.claimed, EAlreadyClaimed);
        assert!(ticket.winning_tier > 0, ENotWinning);
        ticket.claimed = true;
    }

    /// 轉移彩券給購買者
    public(package) fun transfer_ticket(ticket: Ticket, recipient: address) {
        transfer::public_transfer(ticket, recipient);
    }

    /// 刪除彩券（用於測試或特殊情況）
    public(package) fun delete_ticket(ticket: Ticket) {
        let Ticket {
            id,
            round_id: _,
            ticket_number: _,
            numbers: _,
            purchased_at: _,
            claimed: _,
            winning_tier: _
        } = ticket;
        object::delete(id);
    }

    // === Getter 函數 ===

    public fun get_round_id(ticket: &Ticket): vector<u8> {
        ticket.round_id
    }

    public fun get_ticket_number(ticket: &Ticket): u64 {
        ticket.ticket_number
    }

    public fun get_numbers(ticket: &Ticket): vector<u8> {
        ticket.numbers
    }

    public fun get_purchased_at(ticket: &Ticket): u64 {
        ticket.purchased_at
    }

    public fun is_claimed(ticket: &Ticket): bool {
        ticket.claimed
    }

    public fun get_winning_tier(ticket: &Ticket): u8 {
        ticket.winning_tier
    }

    public fun is_winning(ticket: &Ticket): bool {
        ticket.winning_tier > 0
    }

    #[test]
    fun test_validate_numbers() {
        let valid_numbers = vector[1u8, 5u8, 10u8, 20u8, 30u8, 45u8];
        validate_numbers(&valid_numbers);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidNumberCount)]
    fun test_invalid_count() {
        let invalid = vector[1u8, 2u8, 3u8]; // 只有 3 個
        validate_numbers(&invalid);
    }

    #[test]
    #[expected_failure(abort_code = EDuplicateNumber)]
    fun test_duplicate_numbers() {
        let duplicate = vector[1u8, 2u8, 3u8, 4u8, 5u8, 5u8]; // 有重複
        validate_numbers(&duplicate);
    }

    #[test]
    fun test_count_matches() {
        let ticket_nums = vector[1u8, 5u8, 10u8, 20u8, 30u8, 45u8];
        let winning_nums = vector[1u8, 10u8, 20u8, 25u8, 35u8, 40u8];

        let matches = count_matches(&ticket_nums, &winning_nums);
        assert!(matches == 3, 0); // 應該匹配 3 個號碼
    }
}
