/// 集成測試 - 測試完整的樂透流程
#[test_only]
module suipot_lotto::integration_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use suipot_lotto::lottopot::{Self, LotteryRound, SystemConfig, AdminCap as LotteryAdminCap};
    use suipot_lotto::treasury::{Self, Treasury, AdminCap as TreasuryAdminCap};
    use suipot_lotto::ticket::{Self, Ticket};
    use std::vector;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const USER3: address = @0x3;

    fun setup(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            lottopot::init_for_testing(ts::ctx(scenario));
            treasury::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_complete_lottery_flow() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario);

        // === 第 1 步：管理員創建輪次 ===
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<LotteryAdminCap>(&scenario);

            let ticket_price = 1_000_000_000; // 1 SUI
            let duration = 7 * 24 * 60 * 60 * 1000; // 7 天

            lottopot::create_round(
                &admin_cap,
                &mut config,
                ticket_price,
                duration,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // === 第 2 步：多個用戶購買彩券 ===
        // USER1 購買 3 張
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers1 = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
            let numbers2 = vector[2u8, 11u8, 21u8, 31u8, 41u8, 49u8];
            let numbers3 = vector[3u8, 12u8, 22u8, 32u8, 42u8, 48u8];
            let number_sets = vector[numbers1, numbers2, numbers3];

            let payment = coin::mint_for_testing<SUI>(3_000_000_000, ts::ctx(&mut scenario));

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

        // USER2 購買 2 張
        ts::next_tx(&mut scenario, USER2);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers1 = vector[5u8, 15u8, 25u8, 35u8, 45u8, 47u8];
            let numbers2 = vector[6u8, 16u8, 26u8, 36u8, 46u8, 44u8];
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

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // USER3 購買 1 張
        ts::next_tx(&mut scenario, USER3);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers = vector[7u8, 17u8, 27u8, 37u8, 43u8, 39u8];
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

        // === 第 3 步：驗證購票結果 ===
        ts::next_tx(&mut scenario, ADMIN);
        {
            let round = ts::take_shared<LotteryRound>(&scenario);
            let treasury = ts::take_shared<Treasury>(&scenario);

            // 總共售出 6 張票
            assert_eq(lottopot::get_total_tickets_sold(&round), 6);

            // 獎金池 = 6 SUI * 95% = 5.7 SUI
            let expected_prize_pool = 5_700_000_000;
            assert_eq(lottopot::get_prize_pool(&round), expected_prize_pool);

            // 手續費 = 6 SUI * 5% = 0.3 SUI
            let expected_fees = 300_000_000;
            assert_eq(treasury::get_fees_balance(&treasury), expected_fees);

            ts::return_shared(round);
            ts::return_shared(treasury);
        };

        // === 第 4 步：驗證用戶收到彩券 ===
        ts::next_tx(&mut scenario, USER1);
        {
            let ticket_ids = ts::ids_for_sender<Ticket>(&scenario);
            assert_eq(vector::length(&ticket_ids), 3);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            let ticket_ids = ts::ids_for_sender<Ticket>(&scenario);
            assert_eq(vector::length(&ticket_ids), 2);
        };

        ts::next_tx(&mut scenario, USER3);
        {
            let ticket_ids = ts::ids_for_sender<Ticket>(&scenario);
            assert_eq(vector::length(&ticket_ids), 1);
        };

        // === 第 5 步：管理員提領手續費 ===
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let treasury_admin_cap = ts::take_from_sender<TreasuryAdminCap>(&scenario);

            let withdrawn = treasury::withdraw_fees(
                &treasury_admin_cap,
                &mut treasury,
                150_000_000, // 提領 0.15 SUI
                ts::ctx(&mut scenario)
            );

            assert_eq(coin::value(&withdrawn), 150_000_000);
            assert_eq(treasury::get_fees_balance(&treasury), 150_000_000); // 剩餘 0.15 SUI

            coin::burn_for_testing(withdrawn);
            ts::return_to_sender(&scenario, treasury_admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_pause_resume_flow() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario);

        // 創建輪次
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<LotteryAdminCap>(&scenario);

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

        // 正常購票
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers = vector[1u8, 10u8, 20u8, 30u8, 40u8, 50u8];
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                vector[numbers],
                payment,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 管理員暫停系統
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<LotteryAdminCap>(&scenario);

            lottopot::pause(&admin_cap, &mut config, ts::ctx(&mut scenario));
            assert_eq(lottopot::is_paused(&config), true);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // 恢復系統
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<LotteryAdminCap>(&scenario);

            lottopot::resume(&admin_cap, &mut config, ts::ctx(&mut scenario));
            assert_eq(lottopot::is_paused(&config), false);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(config);
        };

        // 恢復後可以繼續購票
        ts::next_tx(&mut scenario, USER2);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let numbers = vector[2u8, 11u8, 21u8, 31u8, 41u8, 49u8];
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                vector[numbers],
                payment,
                ts::ctx(&mut scenario)
            );

            assert_eq(lottopot::get_total_tickets_sold(&round), 2);

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_batch_purchase_max_tickets() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario);

        // 創建輪次
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<SystemConfig>(&scenario);
            let admin_cap = ts::take_from_sender<LotteryAdminCap>(&scenario);

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

        // 購買最大數量（50 張）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut round = ts::take_shared<LotteryRound>(&scenario);
            let config = ts::take_shared<SystemConfig>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);

            let mut number_sets = vector::empty();
            let mut i = 0u8;
            while (i < 50) {
                let num_start = (i % 45) + 1; // 確保在 1-50 範圍內
                let numbers = vector[
                    num_start,
                    num_start + 1,
                    num_start + 2,
                    num_start + 3,
                    num_start + 4,
                    50u8
                ];
                vector::push_back(&mut number_sets, numbers);
                i = i + 1;
            };

            let payment = coin::mint_for_testing<SUI>(50_000_000_000, ts::ctx(&mut scenario));

            lottopot::purchase_tickets(
                &mut round,
                &config,
                &mut treasury,
                number_sets,
                payment,
                ts::ctx(&mut scenario)
            );

            assert_eq(lottopot::get_total_tickets_sold(&round), 50);

            ts::return_shared(round);
            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 驗證用戶收到 50 張彩券
        ts::next_tx(&mut scenario, USER1);
        {
            let ticket_ids = ts::ids_for_sender<Ticket>(&scenario);
            assert_eq(vector::length(&ticket_ids), 50);
        };

        ts::end(scenario);
    }
}
