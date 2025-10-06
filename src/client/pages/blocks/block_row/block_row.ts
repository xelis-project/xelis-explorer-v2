import { Block, BlockType, GetInfoResult } from "@xelis/sdk/daemon/types";
import { format_address } from "../../../utils/format_address";
//@ts-ignore
import hashicon from "hashicon";
import prettyBytes from "pretty-bytes";
import { reduce_text } from "../../../utils/reduce_text";
import { format_xel } from "../../../utils/format_xel";
import { format_hashrate } from "../../../utils/format_hashrate";
import prettyMilliseconds from "pretty-ms";
import { BlockTypeBox } from "../../../components/block_type_box/block_type_box";
import { Row } from "../../../components/table/row";

import './block_row.css';

export class BlockRow extends Row {
    data?: Block;

    constructor() {
        super(10);
    }

    set(block: Block, block_time_target: number) {
        this.data = block;
        this.set_topoheight(block.topoheight);
        this.set_height(block.height);
        this.set_type(block.block_type);
        this.set_miner(block.miner);
        this.set_size(block.total_size_in_bytes);
        this.set_tx_count(block.txs_hashes.length);
        this.set_hash(block.hash);
        this.set_reward(block.reward);
        this.set_diff(parseInt(block.difficulty), block_time_target);
        this.set_age(block.timestamp);
        this.set_link(`/block/${block.hash}`);
    }

    set_topoheight(topoheight?: number) {
        this.value_cells[0].innerHTML = topoheight ? topoheight.toLocaleString() : `--`;
    }

    set_height(height: number) {
        this.value_cells[1].innerHTML = height.toLocaleString();
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

        this.value_cells[2].replaceChildren();
        this.value_cells[2].appendChild(container);
    }

    set_miner(miner: string) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-miner`);

        const miner_icon = hashicon(miner, 25) as HTMLCanvasElement;
        container.appendChild(miner_icon);

        const miner_addr = document.createElement(`div`);
        miner_addr.innerHTML = format_address(miner);
        container.appendChild(miner_addr);

        this.value_cells[3].replaceChildren();
        this.value_cells[3].appendChild(container);
    }

    set_size(size_in_bytes: number) {
        this.value_cells[4].innerHTML = prettyBytes(size_in_bytes);
    }

    set_tx_count(tx_count: number) {
        this.value_cells[5].innerHTML = tx_count.toLocaleString(undefined, { minimumIntegerDigits: 4, notation: "compact" });
    }

    set_hash(hash: string) {
        this.value_cells[6].innerHTML = reduce_text(hash);
    }

    set_reward(reward?: number) {
        this.value_cells[7].innerHTML = reward ? format_xel(reward, true) : `--`;
    }

    set_diff(difficulty: number, block_time_target: number) {
        this.value_cells[8].innerHTML = format_hashrate(difficulty, block_time_target);
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.value_cells[9].innerHTML = prettyMilliseconds(Date.now() - timestamp, { colonNotation: true, secondsDecimalDigits: 0 });
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }
}