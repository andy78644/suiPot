/// 隨機數生成模組 - 封裝 Sui 的隨機數功能
module suipot_lotto::random {
    use sui::random::{Self, Random};
    use std::vector;

    /// 生成 6 個不重複的隨機號碼（1-50）
    /// 用於樂透開獎
    public fun generate_winning_numbers(r: &Random, ctx: &mut sui::tx_context::TxContext): vector<u8> {
        let mut generator = random::new_generator(r, ctx);
        let mut numbers = vector::empty<u8>();

        // 生成 6 個不重複的號碼
        while (vector::length(&numbers) < 6) {
            // 生成 1-50 的隨機數
            let num = (random::generate_u8(&mut generator) % 50) + 1;

            // 確保不重複
            if (!vector::contains(&numbers, &num)) {
                vector::push_back(&mut numbers, num);
            };
        };

        numbers
    }

    /// 生成單個 1-50 的隨機數
    public fun generate_single_number(r: &Random, ctx: &mut sui::tx_context::TxContext): u8 {
        let mut generator = random::new_generator(r, ctx);
        (random::generate_u8(&mut generator) % 50) + 1
    }

    /// 生成指定範圍內的隨機數
    public fun generate_number_in_range(
        r: &Random,
        min: u8,
        max: u8,
        ctx: &mut sui::tx_context::TxContext
    ): u8 {
        assert!(max > min, 0);
        let mut generator = random::new_generator(r, ctx);
        let range = max - min + 1;
        (random::generate_u8(&mut generator) % range) + min
    }

    #[test_only]
    /// 測試用：生成固定的"隨機"數字序列
    public fun generate_mock_winning_numbers(): vector<u8> {
        vector[5u8, 12u8, 23u8, 34u8, 41u8, 48u8]
    }
}
