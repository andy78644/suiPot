/// 金庫管理模組測試
#[test_only]
module suipot_lotto::treasury_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use suipot_lotto::treasury::{Self, Treasury, AdminCap};

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;

    fun setup_test(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            treasury::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_collect_fees() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let round_id = b"round_1";
            let fees = coin::mint_for_testing<SUI>(50_000_000, ts::ctx(&mut scenario)); // 0.05 SUI

            treasury::collect_fees(&mut treasury, round_id, fees);

            assert_eq(treasury::get_fees_balance(&treasury), 50_000_000);
            assert_eq(treasury::get_total_fees_collected(&treasury), 50_000_000);

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_collect_multiple_fees() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            // 收集第一筆手續費
            let round_id_1 = b"round_1";
            let fees_1 = coin::mint_for_testing<SUI>(50_000_000, ts::ctx(&mut scenario));
            treasury::collect_fees(&mut treasury, round_id_1, fees_1);

            // 收集第二筆手續費
            let round_id_2 = b"round_2";
            let fees_2 = coin::mint_for_testing<SUI>(30_000_000, ts::ctx(&mut scenario));
            treasury::collect_fees(&mut treasury, round_id_2, fees_2);

            assert_eq(treasury::get_fees_balance(&treasury), 80_000_000);
            assert_eq(treasury::get_total_fees_collected(&treasury), 80_000_000);

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_withdraw_fees() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 先收集一些手續費
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let round_id = b"round_1";
            let fees = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            treasury::collect_fees(&mut treasury, round_id, fees);
            ts::return_shared(treasury);
        };

        // 提領手續費
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            let withdrawn = treasury::withdraw_fees(
                &admin_cap,
                &mut treasury,
                60_000_000,
                ts::ctx(&mut scenario)
            );

            assert_eq(coin::value(&withdrawn), 60_000_000);
            assert_eq(treasury::get_fees_balance(&treasury), 40_000_000);
            assert_eq(treasury::get_total_fees_withdrawn(&treasury), 60_000_000);

            coin::burn_for_testing(withdrawn);
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = treasury::EInsufficientBalance)]
    fun test_withdraw_insufficient_balance() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 嘗試提領超過餘額的金額
            let withdrawn = treasury::withdraw_fees(
                &admin_cap,
                &mut treasury,
                100_000_000,
                ts::ctx(&mut scenario)
            );

            coin::burn_for_testing(withdrawn);
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = treasury::EInvalidAmount)]
    fun test_withdraw_zero_amount() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 嘗試提領 0
            let withdrawn = treasury::withdraw_fees(
                &admin_cap,
                &mut treasury,
                0,
                ts::ctx(&mut scenario)
            );

            coin::burn_for_testing(withdrawn);
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_add_rollover() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let from_round = b"round_1";
            let to_round = b"round_2";
            let amount = coin::mint_for_testing<SUI>(200_000_000, ts::ctx(&mut scenario));

            treasury::add_rollover(&mut treasury, from_round, to_round, amount);

            assert_eq(treasury::get_rollover_balance(&treasury), 200_000_000);
            assert_eq(treasury::get_total_rollover_amount(&treasury), 200_000_000);

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_withdraw_rollover() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 添加 rollover
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let from_round = b"round_1";
            let to_round = b"round_2";
            let amount = coin::mint_for_testing<SUI>(200_000_000, ts::ctx(&mut scenario));
            treasury::add_rollover(&mut treasury, from_round, to_round, amount);
            ts::return_shared(treasury);
        };

        // 提取 rollover
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let rollover = treasury::withdraw_rollover(
                &mut treasury,
                100_000_000,
                ts::ctx(&mut scenario)
            );

            assert_eq(coin::value(&rollover), 100_000_000);
            assert_eq(treasury::get_rollover_balance(&treasury), 100_000_000);

            coin::burn_for_testing(rollover);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = treasury::EInsufficientBalance)]
    fun test_withdraw_rollover_insufficient() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            // 嘗試提取超過餘額的 rollover
            let rollover = treasury::withdraw_rollover(
                &mut treasury,
                100_000_000,
                ts::ctx(&mut scenario)
            );

            coin::burn_for_testing(rollover);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_operations() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 收集手續費
            let fees = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            treasury::collect_fees(&mut treasury, b"round_1", fees);

            // 添加 rollover
            let rollover_amount = coin::mint_for_testing<SUI>(50_000_000, ts::ctx(&mut scenario));
            treasury::add_rollover(&mut treasury, b"round_1", b"round_2", rollover_amount);

            // 提領部分手續費
            let withdrawn = treasury::withdraw_fees(&admin_cap, &mut treasury, 30_000_000, ts::ctx(&mut scenario));

            // 驗證狀態
            assert_eq(treasury::get_fees_balance(&treasury), 70_000_000);
            assert_eq(treasury::get_rollover_balance(&treasury), 50_000_000);
            assert_eq(treasury::get_total_fees_collected(&treasury), 100_000_000);
            assert_eq(treasury::get_total_fees_withdrawn(&treasury), 30_000_000);

            coin::burn_for_testing(withdrawn);
            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }
}
