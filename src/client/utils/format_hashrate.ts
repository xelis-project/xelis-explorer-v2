import { format_diff } from "./format_diff";

export const format_hashrate = (difficulty: number, current_height: number, locale?: Intl.LocalesArgument) => {
    let block_time = 15000;

    // 5s block time now
    if (current_height >= 3282150) {
        block_time = 5000;
    }

    let value = difficulty / (block_time / 1000);
    return `${format_diff(value, locale)}H/s`;
}