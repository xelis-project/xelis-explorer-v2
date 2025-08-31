import { Block, BlockType } from "@xelis/sdk/daemon/types";
import prettyMilliseconds from "pretty-ms";
import prettyBytes from "pretty-bytes";
import { format_xel } from "../../utils/format_xel";
import { format_address } from "../../utils/format_address";
import { Box } from "../box/box";
//@ts-ignore
import hashicon from "hashicon";
import { Localization } from "../../app/localization/localization";
import { BlockTypeBox } from "../block_type_box/block_type_box";

import "./block_item.css";

export class BlockItem {
    box: Box;
    data?: Block;
    element_height: HTMLDivElement;
    element_txs: HTMLDivElement;
    element_age: HTMLDivElement;
    element_size: HTMLDivElement;
    element_miner: HTMLDivElement;
    element_type: HTMLDivElement;
    element_reward: HTMLDivElement;

    constructor() {
        this.box = new Box();
        this.box.element.classList.add(`xe-block-item`);

        const container_1 = document.createElement(`div`);
        this.box.element.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.element_height = document.createElement(`div`);
        this.element_height.classList.add(`xe-block-item-height`);
        sub_container_1.appendChild(this.element_height);

        this.element_txs = document.createElement(`div`);
        this.element_txs.classList.add(`xe-block-item-txs`);
        sub_container_1.appendChild(this.element_txs);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.element_miner = document.createElement(`div`);
        this.element_miner.classList.add(`xe-block-item-miner`);
        sub_container_2.appendChild(this.element_miner);

        const container_2 = document.createElement(`div`);
        this.box.element.appendChild(container_2);

        const sub_container_3 = document.createElement(`div`);
        container_2.appendChild(sub_container_3);

        this.element_age = document.createElement(`div`);
        this.element_age.classList.add(`xe-block-item-age`);
        sub_container_3.appendChild(this.element_age);

        this.element_size = document.createElement(`div`);
        this.element_size.classList.add(`xe-block-item-size`);
        sub_container_3.appendChild(this.element_size);

        const sub_container_4 = document.createElement(`div`);
        container_2.appendChild(sub_container_4);

        this.element_type = document.createElement(`div`);
        this.element_type.classList.add(`xe-block-item-type`);
        sub_container_4.appendChild(this.element_type);

        this.element_reward = document.createElement(`div`);
        this.element_reward.classList.add(`xe-block-item-reward`);
        sub_container_4.appendChild(this.element_reward);
    }

    set(block: Block) {
        this.data = block;
        this.set_height(block.height);
        this.set_tx_count((block.txs_hashes || []).length, 0);
        this.set_miner(block.miner);
        this.set_type(block.block_type);
        this.set_age(block.timestamp);
        this.set_size(block.total_size_in_bytes);
        this.set_reward(block.reward);
    }

    set_height(height: number) {
        this.element_height.innerHTML = `BLOCK ${height.toLocaleString()}`;
    }

    set_tx_count(tx_count: number, tx_max: number) {
        const localization = Localization.instance();
        this.element_txs.innerHTML = localization.get_text(`{} transactions`, [tx_count.toLocaleString()]);
    }

    set_miner(miner: string) {
        const miner_icon = hashicon(miner, 25) as HTMLCanvasElement;
        this.element_miner.replaceChildren();
        this.element_miner.appendChild(miner_icon);
        const miner_text = document.createElement(`div`);
        miner_text.innerHTML = format_address(miner);
        this.element_miner.appendChild(miner_text);
    }

    set_type(block_type: BlockType) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-block-item-type`);

        const block_box_type = new BlockTypeBox();
        block_box_type.set(1, block_type);
        container.appendChild(block_box_type.element);

        const text = document.createElement(`div`);
        text.innerHTML = `${block_type.toUpperCase()} BLOCK`;
        container.appendChild(text);

        this.element_type.replaceChildren();
        this.element_type.appendChild(container);
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.element_age.innerHTML = prettyMilliseconds(Date.now() - timestamp, { compact: true });
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }

    set_size(size_in_bytes: number) {
        this.element_size.innerHTML = prettyBytes(size_in_bytes);
    }

    set_reward(reward?: number) {
        this.element_reward.innerHTML = reward ? format_xel(reward, true) : `--`;
    }

    async animate_prepend() {
        const { animate, utils } = await import("animejs");
        animate(this.box.element, {
            translateX: [`100%`, 0],
            duration: 500,
            onComplete: utils.cleanInlineStyles
        });
    }

    async animate_update() {
        const { animate, eases, utils } = await import("animejs");
        animate(this.box.element, {
            scale: [`100%`, `95%`, `100%`],
            duration: 1000,
            ease: eases.inBack(3),
            onComplete: utils.cleanInlineStyles
        });
    }
}
