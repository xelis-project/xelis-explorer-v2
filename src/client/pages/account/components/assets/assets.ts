import { AssetWithData } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Box } from "../../../../components/box/box";
import { format_hash } from "../../../../utils/format_hash";
import { localization } from "../../../../localization/localization";

import './assets.css';

export class AccountAssets {
    container: Container;
    items_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-assets`, `scrollbar-1`, `scrollbar-1-bottom`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`ASSETS`);
        this.container.element.appendChild(title_element);

        this.items_element = document.createElement(`div`);
        this.container.element.appendChild(this.items_element);
    }

    set(assets_data: AssetWithData[]) {
        this.items_element.replaceChildren();
        assets_data.forEach((asset_data) => {
            const box = new Box();
            box.element.classList.add(`xe-account-assets-item`);
            box.element.innerHTML = `
                <div>${asset_data.name} (${asset_data.ticker})</div>
                <a href="/asset/${asset_data.asset}">${format_hash(asset_data.asset)}</a>
            `;
            this.items_element.appendChild(box.element);
        });
    }
}