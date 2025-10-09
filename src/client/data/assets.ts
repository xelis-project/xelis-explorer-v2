import dev_assets from './dev/assets.json';
import testnet_assets from './testnet/assets.json';
import mainnet_assets from './mainnet/assets.json';

export interface Asset {
    name: string;
    ticker: string;
    decimals: number;
}

export type Assets = Record<string, Asset>;

export const get_assets = () => {
    let assets = {} as Assets;

    switch (import.meta.env.MODE) {
        case "mainnet":
            assets = mainnet_assets;
            break;
        case "testnet":
            assets = testnet_assets;
            break;
        default:
            assets = dev_assets;
            break;
    }

    return assets;
}
