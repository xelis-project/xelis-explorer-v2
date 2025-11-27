import { get_assets } from "../data/assets";
import { parse_atomic } from "./parse_atomic";
import { reduce_text } from "./reduce_text";
import DaemonWS from '@xelis/sdk/daemon/websocket';

export const ws_format_asset = async (ws: DaemonWS, asset_hash: string, atomic_amount: number, locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) => {
    const format = (decimals: number, ticker?: string) => {
        const amount = parse_atomic(atomic_amount, decimals);
        let value = `${amount.toLocaleString(locales, { maximumFractionDigits: decimals, ...options })}`;
        if (ticker) value += ` ${ticker}`;
        else value += ` (${reduce_text(asset_hash)})`;
        return value;
    }

    const assets = get_assets();
    const local_asset = assets[asset_hash];
    if (local_asset) {
        return `${format(local_asset.decimals, local_asset.ticker)}`;
    }

    const asset_data = await ws.methods.getAsset({ asset: asset_hash });
    if (asset_data) {
        return `${format(asset_data.decimals, asset_data.ticker)}`;
    }

    return `${atomic_amount} ATOMIC (${reduce_text(asset_hash)})`;
}