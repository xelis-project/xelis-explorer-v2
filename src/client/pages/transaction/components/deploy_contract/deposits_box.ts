import { ContractDeposit } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";
import { format_hash } from "../../../../utils/format_hash";
import { localization } from "../../../../localization/localization";
import { ws_format_asset } from "../../../../utils/ws_format_asset";
import { XelisNode } from "../../../../app/xelis_node";

import './deposits_box.css';

export class DepositsBox {
    box: Box;

    constructor(deposits: { [hash: string]: ContractDeposit }) {
        this.box = new Box();
        this.box.element.classList.add(`xe-deposits-box`);

        const node = XelisNode.instance();

        Object.keys(deposits).forEach(async (asset_hash, i) => {
            const deposit = deposits[asset_hash];
            const deposit_element = document.createElement(`div`);


            let asset_amount_string = localization.get_text(`ENCRYPTED`);
            if (deposit.public) {
                asset_amount_string = await ws_format_asset(node.ws, asset_hash, deposit.public);
            }

            deposit_element.innerHTML = `
                <div>${i.toLocaleString(undefined, { minimumIntegerDigits: 3, notation: "compact" })}</div>
                <div>${format_hash(asset_hash)}/div>
                <div>${asset_amount_string}</div>
            `;

            this.box.element.appendChild(deposit_element);
        });
    }
}