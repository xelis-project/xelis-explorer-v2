import { Burn } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";
import { Container } from "../../../../components/container/container";
import icons from "../../../../assets/svg/icons";
import { get_assets } from "../../../../data/assets";
import { format_asset } from "../../../../utils/format_asset";
import { format_hash } from "../../../../utils/format_hash";

import './burn.css';

export class TransactionBurn {
    container: Container;

    title_element: HTMLDivElement;
    box: Box;

    constructor(burn: Burn) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-burn`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = `BURN`;
        this.container.element.appendChild(this.title_element);

        this.box = new Box();
        this.container.element.appendChild(this.box.element);

        const assets = get_assets();
        const asset = assets[burn.asset];
        if (asset) {
            this.box.element.classList.add(`xe-transaction-burn-box-1`);
            this.box.element.innerHTML = `
                ${icons.burn()}
                <div>
                    <div>${format_hash(burn.asset)}</div>
                    <div>${asset.name}</div>
                </div>
                <div>${format_asset(burn.asset, burn.amount, true)}</div>
            `;
        } else {
            this.box.element.classList.add(`xe-transaction-burn-box-2`);
            this.box.element.innerHTML = `
                ${icons.burn()}
                <div>${format_hash(burn.asset)}</div>
                <div>
                    <div>${burn.amount}</div>
                    <div>ATOMIC AMOUNT</div>
                </div>
            `;
        }
    }
}