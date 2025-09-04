import { Container } from "../../../../components/container/container";
import { format_address } from "../../../../utils/format_address";
//@ts-ignore
import hashicon from 'hashicon';
import { format_xel } from "../../../../utils/format_xel";
import { Block } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";

import './miner.css';

export class BlockMiner {
    container: Container;
    miner_element: HTMLDivElement;
    reward_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-miner`);

        this.miner_element = document.createElement(`div`);
        this.miner_element.classList.add(`xe-block-miner-miner`);
        this.container.element.appendChild(this.miner_element);

        this.reward_element = document.createElement(`div`);
        this.reward_element.classList.add(`xe-block-reward`);
        this.container.element.appendChild(this.reward_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.miner_element, loading);
        Box.content_loading(this.reward_element, loading);
    }

    set(block: Block) {
        this.set_miner(block.miner);
        this.set_reward(block.miner_reward);
    }

    set_miner(miner: string) {
        this.miner_element.replaceChildren();

        const miner_icon = hashicon(miner, 45) as HTMLCanvasElement;
        this.miner_element.appendChild(miner_icon);

        const sub_container = document.createElement(`div`);
        this.miner_element.appendChild(sub_container);

        const miner_addr = document.createElement(`div`);
        miner_addr.innerHTML = format_address(miner);
        sub_container.appendChild(miner_addr);

        const text = document.createElement(`div`);
        text.innerHTML = `MINER`;
        sub_container.appendChild(text);
    }

    set_reward(reward?: number) {
        this.reward_element.innerHTML = `
            <div>MINER REWARD</div>
            <div>${reward ? format_xel(reward, true) : `--`}</div>
        `;
    }
}