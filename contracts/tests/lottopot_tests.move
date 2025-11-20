/// 核心樂透合約測試
#[test_only]
module suipot_lotto::lottopot_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use suipot_lotto::lottopot::{Self, LotteryRound, SystemConfig, AdminCap};
    use suipot_lotto::treasury::{Self, Treasury};
    use suipot_lotto::ticket::{Self, Ticket};
    use std::vector;
    use std::string;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    fun setup_test(scenario: &mut Scenario) {
        // 初始化合約
        ts::next_tx(scenario, ADMIN);
        {
            lottopot::init_for_testing(ts::ctx(scenario));
            treasury::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_create_round() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            let ticket_price = 1_000_000_000; // 1 SUI
            let duration = 7 * 24 * 60 * 60 * 1000; // 7 天

            let _round_addr = lottopot::create_round(
                &admin_cap,
                &mut config,
                ticket_price,
                duration,
                ts::ctx(&mut scenario)
            );

            assert_eq(lottopot::get_current_round_number(&config), 1);
            assert_eq(lottopot::is_paused(&config), false);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_purchase_tickets() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建輪次
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            lottopot::create_round(
                &admin_cap,
                &mut config,
                1_000_000_000,
                7 * 24 * 60 * 60 * 1000,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // 用戶購買彩券
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers1 = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
            let numbers2 = vector[2u8, 11u8, 21u8, 31u8, 41u8, 49u8];
            let number_sets = vector[numbers1, numbers2];

            let payment = coin::mint_for_testing<SUI>(2_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                number_sets,
                payment,
                ts::ctx(&mut scenario)
            );

            assert_eq(lottopot::get_total_tickets_sold(&round), 2);
            assert!(lottopot::get_prize_pool(&round) > 0);

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 檢查用戶收到彩券
        ts::next_tx(&mut scenario, USER1);
        {
            let ticket_ids = ts::ids_for_sender<Ticket>(&scenario);
            assert_eq(vector::length(&ticket_ids), 2);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lottopot::EInvalidTicketCount)]
    fun test_purchase_too_many_tickets() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建輪次
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            lottopot::create_round(
                &admin_cap,
                &mut config,
                1_000_000_000,
                7 * 24 * 60 * 60 * 1000,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // 嘗試購買超過 50 張
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let mut number_sets = vector::empty();
            let mut i = 0;
            while (i < 51) { // 超過限制
                let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
                vector::push_back(&mut number_sets, numbers);
                i = i + 1;
            };

            let payment = coin::mint_for_testing<SUI>(51_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                number_sets,
                payment,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lottopot::EInsufficientPayment)]
    fun test_purchase_insufficient_payment() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            lottopot::create_round(
                &admin_cap,
                &mut config,
                1_000_000_000,
                7 * 24 * 60 * 60 * 1000,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
            let number_sets = vector[numbers];

            // 支付不足
            let payment = coin::mint_for_testing<SUI>(500_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                number_sets,
                payment,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_pause_and_resume() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 暫停系統
            lottopot::pause(&admin_cap, &mut config, ts::ctx(&mut scenario));
            assert_eq(lottopot::is_paused(&config), true);

            // 恢復系統
            lottopot::resume(&admin_cap, &mut config, ts::ctx(&mut scenario));
            assert_eq(lottopot::is_paused(&config), false);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lottopot::EPaused)]
    fun test_purchase_when_paused() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            lottopot::create_round(
                &admin_cap,
                &mut config,
                1_000_000_000,
                7 * 24 * 60 * 60 * 1000,
                ts::ctx(&mut scenario)
            );

            // 暫停系統
            lottopot::pause(&admin_cap, &mut config, ts::ctx(&mut scenario));

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // 嘗試在暫停時購買
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
            let number_sets = vector[numbers];
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                number_sets,
                payment,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_update_fee_rate() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 更新手續費比例到 8%
            lottopot::update_fee_rate(&admin_cap, &mut config, 800);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lottopot::EInvalidFeeRate)]
    fun test_update_fee_rate_too_high() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // 嘗試設置超過 10% 的手續費
            lottopot::update_fee_rate(&admin_cap, &mut config, 1100);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }
}
