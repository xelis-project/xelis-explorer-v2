import { AssetCreator, AssetOwner, AssetWithData, GetContractBalanceResult, MaxSupplyFixed, MaxSupplyMintable } from "@xelis/sdk/daemon/types";
import { format_xel } from "../../../utils/format_xel";
import { Row } from "../../../components/table/row";
import { ContractInfo } from "../../../fetch_helpers/fetch_contracts";
import { format_hash } from "../../../utils/format_hash";

import './asset_row.css';
import { ws_format_asset } from "../../../utils/ws_format_asset";
import { XelisNode } from "../../../app/xelis_node";

export class AssetRow extends Row {
    constructor() {
        super(7);
    }

    set(asset: AssetWithData) {
        this.set_hash(asset.asset);
        this.set_name(asset.name);
        this.set_ticker(asset.ticker);
        this.set_max_supply(asset.asset, asset.max_supply);
        this.set_owner(asset.owner);
        this.set_topoheight(asset.topoheight);
        this.set_decimals(asset.decimals);
    }

    set_hash(hash: string) {
        this.value_cells[0].innerHTML = format_hash(hash);
    }

    set_name(name: string) {
        this.value_cells[1].innerHTML = name;
    }

    set_ticker(ticker: string) {
        this.value_cells[2].innerHTML = ticker;
    }

    async set_max_supply(hash: string, max_supply: "none" | MaxSupplyFixed | MaxSupplyMintable) {
        const xelis_node = XelisNode.instance();

        let display_value = ``;
        if (max_supply === `none`) {
            display_value = `None`;
        } else if ("fixed" in max_supply) {
            const formatted_value = await ws_format_asset(xelis_node.ws, hash, max_supply.fixed);
            display_value = `Fixed (${formatted_value})`;
        } else if ("mintable" in max_supply) {
            const formatted_value = await ws_format_asset(xelis_node.ws, hash, max_supply.mintable);
            display_value = `Mintable (${formatted_value})`;
        }

        this.value_cells[3].innerHTML = display_value;
    }

    set_owner(owner: "none" | AssetCreator | AssetOwner) {
        let display_value = ``;
        if (owner === `none`) {
            display_value = `None`;
        } else if ("contract" in owner) {
            display_value = ``;
        } else if ("owner" in owner) {
            display_value = ``;
        }

        this.value_cells[4].innerHTML = display_value;
    }

    set_topoheight(topoheight: number) {
        this.value_cells[5].innerHTML = topoheight.toLocaleString();
    }

    set_decimals(decimals: number) {
        this.value_cells[6].innerHTML = decimals.toLocaleString();
    }
}
