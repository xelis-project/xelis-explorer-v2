import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { BlockItem } from "../../../../components/block_item/block_item";

import "./blocks.css";

export class DashboardBlocks {
    container: Container;
    block_items: BlockItem[];

    constructor() {
        this.container = new Container();
        this.block_items = [];

        this.container.element.classList.add(`xe-dashboard-blocks`, `scrollbar-1`, `scrollbar-1-right`);
    }

    load(blocks: Block[]) {
        this.container.element.replaceChildren();
        blocks.forEach(block => this.add_block(block));
    }

    set_loading() {
        for (let i = 0; i < 20; i++) {
            this.add_empty_block();
        }
    }

    add_empty_block() {
        const block_item = new BlockItem();
        block_item.box.set_loading(true);
        this.container.element.appendChild(block_item.box.element);
    }

    add_block(block: Block) {
        const block_item = new BlockItem();
        block_item.set(block);
        this.block_items.push(block_item);
        this.container.element.appendChild(block_item.box.element);
    }
}