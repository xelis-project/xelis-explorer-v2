import { format_diff } from "./format_diff";
import { get_block_time_by_version } from "./get_block_time";

export const format_hashrate = (difficulty: number, current_version: number, locale?: Intl.LocalesArgument) => {
    const block_time = get_block_time_by_version(current_version);
    let value = difficulty / (block_time / 1000);
    return `${format_diff(value, locale)}H/s`;
}