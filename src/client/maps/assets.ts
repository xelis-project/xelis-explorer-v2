import { XELIS_ASSET, XELIS_DECIMALS } from "@xelis/sdk/config";

interface Asset {
    name: string;
    ticker: string;
    decimals: number;
}

export default {
    [XELIS_ASSET]: {
        name: "XELIS",
        ticker: "XEL",
        decimals: XELIS_DECIMALS
    },
    // Add most popular assets here :)
} as Record<string, Asset>;
