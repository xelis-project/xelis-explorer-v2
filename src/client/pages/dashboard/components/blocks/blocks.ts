import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { BlockItem } from "../../../../components/block_item/block_item";
import { DashboardPage } from "../../dashboards";
import { App } from "../../../../app/app";

import "./blocks.css";

export class DashboardBlocks {
    container: Container;
    block_items: BlockItem[];

    element_title: HTMLDivElement;
    element_content: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-blocks`, `scrollbar-1`, `scrollbar-1-right`);

        this.block_items = [];

        this.element_title = document.createElement(`div`);
        this.element_title.innerHTML = `BLOCKS`;
        this.container.element.appendChild(this.element_title);

        this.element_content = document.createElement(`div`);
        this.container.element.appendChild(this.element_content);
    }

    set(blocks: Block[]) {
        this.element_content.replaceChildren();
        blocks.forEach(block => this.prepend_block(block));
    }

    prepend_block(block: Block) {
        const block_item = new BlockItem(`/block/${block.hash}`);
        block_item.set(block);
        //block_item.box.element.addEventListener(`click`, () => {
        //     App.instance().go_to(`/block/${block.hash}`);
        //});

        this.block_items.unshift(block_item);
        this.element_content.insertBefore(block_item.box.element, this.element_content.firstChild);
        return block_item;
    }

    remove_last_block() {
        const last_block_item = this.block_items.pop();
        if (last_block_item) {
            last_block_item.box.element.remove();
        }
    }
}