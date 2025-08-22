import { format_diff } from "./format_diff";

export const format_hashrate = (difficulty: number, block_time: number, locale?: Intl.LocalesArgument) => {
    let value = difficulty / (block_time / 1000);
    return `${format_diff(value, locale)}H/s`;
}