import { XELIS_ASSET } from "@xelis/sdk/config";
import { format_asset } from "./format_asset";

export const format_xel = (atomic_amount: number, with_ticker: boolean, locale?: Intl.LocalesArgument) => {
    return format_asset(XELIS_ASSET, atomic_amount, with_ticker, locale);
}