import { format_diff } from "./format_diff";
import { get_block_time_by_height } from "./get_block_time";

export const format_hashrate = (difficulty: number, current_height: number, locale?: Intl.LocalesArgument) => {
    const block_time = get_block_time_by_height(current_height);
    let value = difficulty / (block_time / 1000);
    return `${format_diff(value, locale)}H/s`;
}