import { Block, GetInfoResult } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { format_diff } from "../../../../utils/format_diff";
import { format_hashrate } from "../../../../utils/format_hashrate";
import { Box } from "../../../../components/box/box";
import { localization } from "../../../../localization/localization";

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

    set_loading(loading: boolean) {
        Box.content_loading(this.hashrate_element, loading);
        Box.content_loading(this.diff_element, loading);
        Box.content_loading(this.cum_diff_element, loading);
    }

    set(block: Block) {
        this.set_hashrate(block);
        this.set_diff(parseInt(block.difficulty));
        this.set_cum_diff(parseInt(block.cumulative_difficulty));
    }

    set_hashrate(block: Block) {
        this.hashrate_element.innerHTML = `
            <div>${localization.get_text(`HASHRATE`)}</div>
            <div>${format_hashrate(parseInt(block.difficulty), block.height)}</div>
        `;
    }

    set_diff(difficulty: number) {
        this.diff_element.innerHTML = `
            <div>${localization.get_text(`DIFFICULTY`)}</div>
            <div>${format_diff(difficulty)}</div>
        `;
    }

    set_cum_diff(cum_difficulty: number) {
        this.cum_diff_element.innerHTML = `
            <div>${localization.get_text(`Σ DIFFICULTY`)}</div>
            <div>${format_diff(cum_difficulty)}</div>
        `;
    }
}