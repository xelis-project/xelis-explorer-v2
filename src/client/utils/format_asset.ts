import { parse_atomic } from "./parse_atomic";

export const format_asset = (atomic_amount: number, decimals: number, ticker: string, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) => {
    const amount = parse_atomic(atomic_amount, decimals);
    let value = `${amount.toLocaleString(locale, { maximumFractionDigits: decimals, ...options })}`;
    if (ticker) value += ` ${ticker}`;
    return value;
}