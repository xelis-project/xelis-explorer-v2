import { Block, GetInfoResult } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Box } from "../../../../components/box/box";
import { localization } from "../../../../localization/localization";
import { format_xel } from "../../../../utils/format_xel";

import './rewards.css';

export class BlockRewards {
    container: Container;

    miner_reward_element: HTMLDivElement;
    dev_reward_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-rewards`);

        this.miner_reward_element = document.createElement(`div`);
        this.container.element.appendChild(this.miner_reward_element);

        this.dev_reward_element = document.createElement(`div`);
        this.container.element.appendChild(this.dev_reward_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.dev_reward_element, loading);
        Box.content_loading(this.miner_reward_element, loading);
    }

    set(block: Block) {
        this.set_miner_reward(block.miner_reward);
        this.set_dev_reward(block.dev_reward);
    }

    set_miner_reward(miner_reward?: number) {
        this.miner_reward_element.innerHTML = `
            <div>${localization.get_text(`MINER REWARD`)}</div>
            <div>${miner_reward ? format_xel(miner_reward, true) : `--`}</div>
        `;
    }

    set_dev_reward(dev_reward?: number) {
        this.dev_reward_element.innerHTML = `
            <div>${localization.get_text(`DEV REWARD`)}</div>
            <div>${dev_reward ? format_xel(dev_reward, true, undefined, { maximumFractionDigits: 4 }) : `--`}</div>
        `;
    }
}