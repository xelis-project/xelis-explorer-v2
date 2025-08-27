import { Page } from "../page";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { Block } from "@xelis/sdk/daemon/types";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { BlockRow } from "./block_row/block_row";

import './blocks.css';
import { App } from "../../app/app";

export class BlocksPage extends Page {
    static pathname = "/blocks";
    static title = "Blocks";

    master: Master;

    container_table: Container;
    table: Table;

    constructor() {
        super();
        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-blocks`);

        this.container_table = new Container();
        this.container_table.element.classList.add(`xe-blocks-table`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.container_table.element.appendChild(this.table.element);

        const titles = ["TOPO HEIGHT", "HEIGHT", "BLOCK", "POOL / MINER", "SIZE", "TX COUNT", "HASH", "REWARD", "DIFF", "AGE"];
        this.table.set_head_row(titles);
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        const node = XelisNode.instance();

        for (let i = 0; i < 50; i++) {
            const block_row = new BlockRow();
            block_row.set_loading(true);
            this.table.prepend_row(block_row.element);
        }

        const info = await node.rpc.getInfo();
        const blocks = await node.rpc.getBlocksRangeByTopoheight({
            start_topoheight: info.topoheight - 20,
            end_topoheight: info.topoheight
        });

        this.table.body_element.replaceChildren();
        blocks.forEach((block) => {
            const block_row = new BlockRow();
            block_row.set(block, info);

            block_row.element.addEventListener(`click`, () => {
                App.instance().go_to(`/block/${block.hash}`);
            });

            this.table.prepend_row(block_row.element);
        });
    }
}