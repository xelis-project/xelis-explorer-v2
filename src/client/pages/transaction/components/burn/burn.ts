import { Burn } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";
import { Container } from "../../../../components/container/container";
import icons from "../../../../assets/svg/icons";
import { format_hash } from "../../../../utils/format_hash";
import { localization } from "../../../../localization/localization";
import { ws_format_asset } from "../../../../utils/ws_format_asset";
import { XelisNode } from "../../../../app/xelis_node";

import './burn.css';

export class TransactionBurn {
    container: Container;

    title_element: HTMLDivElement;
    box: Box;

    constructor(burn: Burn) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-burn`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = localization.get_text(`BURN`);
        this.container.element.appendChild(this.title_element);

        this.box = new Box();
        this.container.element.appendChild(this.box.element);
        const node = XelisNode.instance();

        const load = async () => {
            const asset_amount_string = await ws_format_asset(node.ws, burn.asset, burn.amount);

            this.box.element.classList.add(`xe-transaction-burn-box-1`);
            this.box.element.innerHTML = `
                ${icons.burn()}
                <div>
                    <div>${format_hash(burn.asset)}</div>
                </div>
                <div>${asset_amount_string}</div>
            `;
        }

        load();
    }
}