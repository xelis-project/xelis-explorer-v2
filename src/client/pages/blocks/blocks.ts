import { Page } from "../page";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { BlockRow } from "./block_row/block_row";
import { App } from "../../app/app";
import { Block, BlockOrdered, BlockOrphaned, BlockType, RPCEvent as DaemonRPCEvent, GetInfoResult } from "@xelis/sdk/daemon/types";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";

import './blocks.css';

export class BlocksPage extends Page {
    static pathname = "/blocks";
    static title = "Blocks";

    master: Master;

    container_table: Container;
    table: Table;

    block_rows: BlockRow[];
    page_data: {
        info?: GetInfoResult;
    }

    constructor() {
        super();

        this.block_rows = [];
        this.page_data = {};

        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-blocks`);

        this.container_table = new Container();
        this.container_table.element.classList.add(`xe-blocks-table`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.table.set_clickable();
        this.container_table.element.appendChild(this.table.element);

        const titles = ["TOPO HEIGHT", "HEIGHT", "BLOCK", "POOL / MINER", "SIZE", "TX COUNT", "HASH", "REWARD", "DIFF", "AGE"];
        this.table.set_head_row(titles);
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block)

        const { info } = this.page_data;

        if (new_block && info) {
            const block_row = new BlockRow();
            block_row.set(new_block, info.block_time_target);
            this.table.prepend_row(block_row.element);
            this.block_rows.unshift(block_row);
            this.block_rows.pop();
            block_row.animate_prepend();
            this.table.remove_last();
        }

        const node = XelisNode.instance();
        const stable_height = await node.ws.methods.getStableHeight();

        // normal blocks become sync under stableheight if they don't have any side blocks
        // the node does not emit an event for this case
        {
            const side_block_heights = this.block_rows.filter(b => {
                if (b.data && b.data.block_type === BlockType.Side) {
                    return b;
                }
            }).map(b => b.data!.height);

            this.block_rows.forEach((block_row) => {
                const block = block_row.data;
                if (block &&
                    block.height <= stable_height
                    && block.block_type === BlockType.Normal
                    && side_block_heights.indexOf(block.height) === -1
                ) {
                    block.block_type = BlockType.Sync;
                    block_row.set_type(BlockType.Sync);
                    block_row.animate_update();
                }
            });
        }
    }

    on_block_ordered = async (block_ordered?: BlockOrdered | undefined, err?: Error) => {
        console.log("block_ordered", block_ordered);
        if (block_ordered) {
            const block_row = this.block_rows.find(b => b.data && b.data.hash === block_ordered.block_hash);
            if (block_row && block_row.data && this.page_data.info) {
                // refetch block instead of using data from block_ordered
                // block can pass from orphaned to normal, sync
                // other attributes can also change
                const node = XelisNode.instance();
                const block = await node.ws.methods.getBlockByHash({ hash: block_ordered.block_hash });
                const { block_time_target } = this.page_data.info;
                block_row.set(block, block_time_target);
                block_row.animate_update();
            }
        }
    }

    on_block_orphaned = (block_orphaned?: BlockOrphaned | undefined, err?: Error) => {
        console.log("block_orphaned", block_orphaned);
        if (block_orphaned) {
            const block_row = this.block_rows.find(b => b.data && b.data.hash === block_orphaned.block_hash);
            if (block_row && block_row.data) {
                const new_block_type = BlockType.Orphaned;
                block_row.data.block_type = new_block_type;
                block_row.set_type(new_block_type);
                block_row.animate_update();
            }
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
        node.ws.methods.closeListener(DaemonRPCEvent.BlockOrphaned, this.on_block_orphaned);
        node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
        node.ws.methods.listen(DaemonRPCEvent.BlockOrphaned, this.on_block_orphaned);
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(BlocksPage.title);
        this.listen_node_events();
        const node = XelisNode.instance();

        this.table.set_loading(100);

        const info = await node.rpc.getInfo();
        this.page_data.info = info;

        const blocks = await fetch_blocks(info.height, 100);

        this.table.body_element.replaceChildren();
        blocks.forEach((block) => {
            const block_row = new BlockRow();
            block_row.set(block, info.block_time_target);
            this.table.prepend_row(block_row.element);
            this.block_rows.push(block_row);
        });
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}