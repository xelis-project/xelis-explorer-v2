import { Container } from "../../../../components/container/container";
import { format_address } from "../../../../utils/format_address";
import { hashicon } from '@emeraldpay/hashicon';
import { Block } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";
import { localization } from "../../../../localization/localization";

import './miner.css';

export class BlockMiner {
    container: Container;
    miner_element: HTMLAnchorElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-miner`);

        this.miner_element = document.createElement(`a`);
        this.miner_element.classList.add(`xe-block-miner-miner`);
        this.container.element.appendChild(this.miner_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.miner_element, loading);
    }

    set(block: Block) {
        this.set_miner(block.miner);
    }

    set_miner(miner: string) {
        this.miner_element.replaceChildren();

        this.miner_element.href = `/account/${miner}`;

        const miner_icon = hashicon(miner, { size: 45 }) as HTMLCanvasElement;
        this.miner_element.appendChild(miner_icon);

        const sub_container = document.createElement(`div`);
        this.miner_element.appendChild(sub_container);

        const miner_addr = document.createElement(`div`);
        miner_addr.innerHTML = format_address(miner);
        sub_container.appendChild(miner_addr);

        const text = document.createElement(`div`);
        text.innerHTML = localization.get_text(`MINER`);
        sub_container.appendChild(text);
    }
}