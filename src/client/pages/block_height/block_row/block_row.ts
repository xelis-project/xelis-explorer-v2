import { Block, BlockType } from "@xelis/sdk/daemon/types";
import { format_address } from "../../../utils/format_address";
//@ts-ignore
import hashicon from "hashicon";
import prettyBytes from "pretty-bytes";
import { reduce_text } from "../../../utils/reduce_text";
import { format_xel } from "../../../utils/format_xel";
import prettyMilliseconds from "pretty-ms";
import { BlockTypeBox } from "../../../components/block_type_box/block_type_box";

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

    data?: Block;

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
    }

    set(block: Block) {
        this.data = block;
        this.set_topoheight(block.topoheight);
        this.set_type(block.block_type);
        this.set_miner(block.miner);
        this.set_size(block.total_size_in_bytes);
        this.set_tx_count(block.txs_hashes.length);
        this.set_hash(block.hash);
        this.set_reward(block.reward);
        this.set_age(block.timestamp);
    }

    set_topoheight(topoheight?: number) {
        this.cell_2_element.innerHTML = topoheight ? topoheight.toLocaleString() : `--`;
    }

    set_type(type: BlockType) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-block`);

        const block_box_type = new BlockTypeBox();
        block_box_type.set(1.5, type);
        container.appendChild(block_box_type.element);

        const text = document.createElement(`div`);
        text.innerHTML = type.toUpperCase();
        container.appendChild(text);

        this.cell_3_element.replaceChildren();
        this.cell_3_element.appendChild(container);
    }

    set_miner(miner: string) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-miner`);

        const miner_icon = hashicon(miner, 25) as HTMLCanvasElement;
        container.appendChild(miner_icon);

        const miner_addr = document.createElement(`div`);
        miner_addr.innerHTML = format_address(miner);
        container.appendChild(miner_addr);

        this.cell_7_element.replaceChildren();
        this.cell_7_element.appendChild(container);
    }

    set_size(size_in_bytes: number) {
        this.cell_5_element.innerHTML = prettyBytes(size_in_bytes);
    }

    set_tx_count(tx_count: number) {
        this.cell_4_element.innerHTML = tx_count.toLocaleString(undefined, { minimumIntegerDigits: 4, notation: "compact" });
    }

    set_hash(hash: string) {
        this.cell_1_element.innerHTML = reduce_text(hash);
    }

    set_reward(reward?: number) {
        this.cell_6_element.innerHTML = reward ? format_xel(reward, true) : `--`;
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.cell_8_element.innerHTML = prettyMilliseconds(Date.now() - timestamp, { compact: true });
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }
}