import { ContractDeposit } from "@xelis/sdk/daemon/types";
import { format_asset } from "../../../../utils/format_asset";
import { Box } from "../../../../components/box/box";
import { get_assets } from "../../../../data/assets";
import { format_hash } from "../../../../utils/format_hash";
import { localization } from "../../../../localization/localization";

import './deposits_box.css';

export class DepositsBox {
    box: Box;

    constructor(deposits: { [hash: string]: ContractDeposit }) {
        this.box = new Box();
        this.box.element.classList.add(`xe-deposits-box`);

        Object.keys(deposits).forEach((hash, i) => {
            const deposit = deposits[hash];
            const deposit_element = document.createElement(`div`);

                    const assets = get_assets();
            let asset = assets[hash];

            let amount_string = localization.get_text(`ENCRYPTED`);
            if (deposit.public) {
                if (asset) {
                    amount_string = format_asset(hash, deposit.public, true);
                } else {
                    amount_string = localization.get_text(`{} (ATOMIC)`, [deposit.public.toLocaleString()]);
                }
            }

            let asset_name = ``;
            if (asset) asset_name = ` (${asset.name})`;

            deposit_element.innerHTML = `
                <div>${i.toLocaleString(undefined, { minimumIntegerDigits: 3, notation: "compact" })}</div>
                <div>${format_hash(hash)}${asset_name}</div>
                <div>${amount_string}</div>
            `;

            this.box.element.appendChild(deposit_element);
        });
    }
}