import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { BlockItem } from "../../../../components/block_item/block_item";
import { DashboardPage } from "../../dashboards";
import { App } from "../../../../app/app";

import "./blocks.css";

export class DashboardBlocks {
    container: Container;
    block_items: BlockItem[];

    constructor() {
        this.container = new Container();
        this.block_items = [];

        this.container.element.classList.add(`xe-dashboard-blocks`, `scrollbar-1`, `scrollbar-1-right`);
    }

    set(blocks: Block[]) {
        this.container.element.replaceChildren();
        blocks.forEach(block => this.prepend_block(block));
    }

    set_loading() {
        this.container.element.replaceChildren();
        for (let i = 0; i < 20; i++) {
            this.add_empty_block();
        }
    }

    add_empty_block() {
        const block_item = new BlockItem();
        block_item.box.set_loading(true);
        this.container.element.appendChild(block_item.box.element);
    }

    prepend_block(block: Block) {
        const block_item = new BlockItem();
        block_item.set(block);
        block_item.box.element.addEventListener(`click`, () => {
            App.instance().go_to(`/block/${block.hash}`);
        });

        this.block_items.unshift(block_item);
        this.container.element.insertBefore(block_item.box.element, this.container.element.firstChild);
        return block_item;
    }

    remove_last_block() {
        const last_block_item = this.block_items.pop();
        if (last_block_item) {
            last_block_item.box.element.remove();
        }
    }
}