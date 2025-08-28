import { Block, BlockType, GetInfoResult } from "@xelis/sdk/daemon/types";
import { format_address } from "../../../utils/format_address";
//@ts-ignore
import hashicon from "hashicon";
import prettyBytes from "pretty-bytes";
import { reduce_text } from "../../../utils/reduce_text";
import { format_xel } from "../../../utils/format_xel";
import { format_hashrate } from "../../../utils/format_hashrate";
import prettyMilliseconds from "pretty-ms";

import './block_row.css';

export class BlockRow {
    element: HTMLTableRowElement;
    cell_1_element: HTMLTableCellElement;
    cell_2_element: HTMLTableCellElement;
    cell_3_element: HTMLTableCellElement;
    cell_4_element: HTMLTableCellElement;
    cell_5_element: HTMLTableCellElement;
    cell_6_element: HTMLTableCellElement;
    cell_7_element: HTMLTableCellElement;
    cell_8_element: HTMLTableCellElement;
    cell_9_element: HTMLTableCellElement;
    cell_10_element: HTMLTableCellElement;

    constructor() {
        this.element = document.createElement(`tr`);

        this.cell_1_element = document.createElement(`td`);
        this.element.appendChild(this.cell_1_element);
        this.cell_2_element = document.createElement(`td`);
        this.element.appendChild(this.cell_2_element);
        this.cell_3_element = document.createElement(`td`);
        this.element.appendChild(this.cell_3_element);
        this.cell_4_element = document.createElement(`td`);
        this.element.appendChild(this.cell_4_element);
        this.cell_5_element = document.createElement(`td`);
        this.element.appendChild(this.cell_5_element);
        this.cell_6_element = document.createElement(`td`);
        this.element.appendChild(this.cell_6_element);
        this.cell_7_element = document.createElement(`td`);
        this.element.appendChild(this.cell_7_element);
        this.cell_8_element = document.createElement(`td`);
        this.element.appendChild(this.cell_8_element);
        this.cell_9_element = document.createElement(`td`);
        this.element.appendChild(this.cell_9_element);
        this.cell_10_element = document.createElement(`td`);
        this.element.appendChild(this.cell_10_element);
    }

    set(block: Block, info: GetInfoResult) {
        this.set_topoheight(block.topoheight);
        this.set_height(block.height);
        this.set_type(block.block_type);
        this.set_miner(block.miner);
        this.set_size(block.total_size_in_bytes);
        this.set_tx_count(block.txs_hashes.length);
        this.set_hash(block.hash);
        this.set_reward(block.reward);
        this.set_diff(parseInt(block.difficulty), info.block_time_target);
        this.set_age(block.timestamp);
    }

    set_topoheight(topoheight?: number) {
        this.cell_1_element.innerHTML = topoheight ? topoheight.toLocaleString() : `--`;
    }

    set_height(height: number) {
        this.cell_2_element.innerHTML = height.toLocaleString();
    }

    set_type(type: BlockType) {
        this.cell_3_element.innerHTML = `
            <div class="xe-blocks-table-block">
                <div class="xe-block-item-type-${type.toLowerCase()}"></div>
                ${type.toUpperCase()}
            </div>
        `;
    }

    set_miner(miner: string) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-miner`);

        const miner_icon = hashicon(miner, 25) as HTMLCanvasElement;
        container.appendChild(miner_icon);

        const miner_addr = document.createElement(`div`);
        miner_addr.innerHTML = format_address(miner);
        container.appendChild(miner_addr);

        this.cell_4_element.replaceChildren();
        this.cell_4_element.appendChild(container);
    }

    set_size(size_in_bytes: number) {
        this.cell_5_element.innerHTML = prettyBytes(size_in_bytes);
    }

    set_tx_count(tx_count: number) {
        this.cell_6_element.innerHTML = tx_count.toLocaleString(undefined, { minimumIntegerDigits: 4, notation: "compact" });
    }

    set_hash(hash: string) {
        this.cell_7_element.innerHTML = reduce_text(hash);
    }

    set_reward(reward?: number) {
        this.cell_8_element.innerHTML = reward ? format_xel(reward, true) : `--`;
    }

    set_diff(difficulty: number, block_time_target: number) {
        this.cell_9_element.innerHTML = format_hashrate(difficulty, block_time_target);
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.cell_10_element.innerHTML = prettyMilliseconds(Date.now() - timestamp, { colonNotation: true, secondsDecimalDigits: 0 });
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }
}