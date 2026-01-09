import { format_asset } from "./format_asset";

export const format_xel = (atomic_amount: number, with_ticker: boolean, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) => {
    return format_asset(atomic_amount, 8, with_ticker ? `XEL` : ``, locale, options);
}