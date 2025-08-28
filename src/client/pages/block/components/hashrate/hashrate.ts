import { Block, GetInfoResult } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { format_diff } from "../../../../utils/format_diff";
import { format_hashrate } from "../../../../utils/format_hashrate";

import './hashrate.css';

export class BlockHashrate {
    container: Container;

    hashrate_element: HTMLDivElement;
    diff_element: HTMLDivElement;
    cum_diff_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-hashrate`);

        this.hashrate_element = document.createElement(`div`);
        this.container.element.appendChild(this.hashrate_element);

        this.diff_element = document.createElement(`div`);
        this.container.element.appendChild(this.diff_element);

        this.cum_diff_element = document.createElement(`div`);
        this.container.element.appendChild(this.cum_diff_element);
    }

    set(block: Block, info: GetInfoResult) {
        this.set_hashrate(parseInt(block.difficulty), info.block_time_target);
        this.set_diff(parseInt(block.difficulty));
        this.set_cum_diff(parseInt(block.cumulative_difficulty));
    }


    set_hashrate(difficulty: number, block_time_target: number) {
        this.hashrate_element.innerHTML = `
            <div>HASHRATE</div>
            <div>${format_hashrate(difficulty, block_time_target)}</div>
        `;
    }

    set_diff(difficulty: number) {
        this.diff_element.innerHTML = `
            <div>DIFF</div>
            <div>${format_diff(difficulty)}</div>
        `;
    }

    set_cum_diff(cum_difficulty: number) {
        this.cum_diff_element.innerHTML = `
            <div>CUM DIFF</div>
            <div>${format_diff(cum_difficulty)}</div>
        `;
    }
}