import { parse_atomic } from "./parse_atomic";
import assets from "../maps/assets";
import { reduce_text } from "./reduce_text";

export const format_asset = (asset_hash: string, atomic_amount: number, with_ticker: boolean, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) => {
    const asset = assets[asset_hash];
    if (asset) {
        const amount = parse_atomic(atomic_amount, asset.decimals);
        let value = `${amount.toLocaleString(locale, { maximumFractionDigits: asset.decimals, ...options })}`;
        if (with_ticker) value += ` ${asset.ticker}`;
        return value;
    }

    return `${atomic_amount} (${reduce_text(asset_hash)})`;
}