/// 彩券模組測試
#[test_only]
module suipot_lotto::ticket_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use suipot_lotto::ticket::{Self, Ticket};
    use std::vector;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;

    #[test]
    fun test_create_valid_ticket() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let ticket = ticket::create_ticket(
            round_id,
            1,
            numbers,
            1000,
            ctx
        );

        assert_eq(ticket::get_ticket_number(&ticket), 1);
        assert_eq(ticket::get_round_id(&ticket), round_id);
        assert_eq(ticket::is_claimed(&ticket), false);
        assert_eq(ticket::get_winning_tier(&ticket), 0);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ticket::EInvalidNumberCount)]
    fun test_create_ticket_invalid_count() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[1u8, 2u8, 3u8]; // 只有 3 個號碼
        let ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ticket::EInvalidNumber)]
    fun test_create_ticket_invalid_range() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[0u8, 10u8, 20u8, 30u8, 40u8, 50u8]; // 0 不在範圍內
        let ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ticket::EDuplicateNumber)]
    fun test_create_ticket_duplicate_numbers() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[5u8, 10u8, 10u8, 20u8, 30u8, 40u8]; // 10 重複
        let ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    fun test_count_matches_all() {
        let ticket_nums = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let winning_nums = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];

        let matches = ticket::count_matches(&ticket_nums, &winning_nums);
        assert_eq(matches, 6u8);
    }

    #[test]
    fun test_count_matches_partial() {
        let ticket_nums = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let winning_nums = vector[1u8, 10u8, 20u8, 5u8, 15u8, 25u8];

        let matches = ticket::count_matches(&ticket_nums, &winning_nums);
        assert_eq(matches, 3u8);
    }

    #[test]
    fun test_count_matches_none() {
        let ticket_nums = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let winning_nums = vector[2u8, 11u8, 21u8, 31u8, 41u8, 49u8];

        let matches = ticket::count_matches(&ticket_nums, &winning_nums);
        assert_eq(matches, 0u8);
    }

    #[test]
    fun test_set_winning_tier_and_claim() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let mut ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        // 設置中獎等級
        ticket::set_winning_tier(&mut ticket, 1u8);
        assert_eq(ticket::get_winning_tier(&ticket), 1);
        assert_eq(ticket::is_winning(&ticket), true);

        // 標記為已領獎
        ticket::mark_claimed(&mut ticket);
        assert_eq(ticket::is_claimed(&ticket), true);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ticket::ENotWinning)]
    fun test_claim_non_winning_ticket() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let mut ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        // 嘗試領取未中獎的彩券
        ticket::mark_claimed(&mut ticket);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ticket::EAlreadyClaimed)]
    fun test_double_claim() {
        let mut scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        let round_id = b"round_1";
        let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
        let mut ticket = ticket::create_ticket(round_id, 1, numbers, 1000, ctx);

        ticket::set_winning_tier(&mut ticket, 1u8);
        ticket::mark_claimed(&mut ticket);

        // 嘗試重複領獎
        ticket::mark_claimed(&mut ticket);

        ticket::delete_ticket(ticket);
        ts::end(scenario);
    }
}
