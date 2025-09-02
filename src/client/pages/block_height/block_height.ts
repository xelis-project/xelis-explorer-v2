import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import { XelisNode } from "../../app/xelis_node";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { Block } from "@xelis/sdk/daemon/types";
import { NotFoundPage } from "../not_found/not_found";
import { Master } from "../../components/master/master";
import { Container } from "../../components/container/container";
import { Table } from "../../components/table/table";
import { BlockRow } from "./block_row/block_row";
import { App } from "../../app/app";

import './block_height.css';

export interface BlockHeightServerData {
    blocks: Block[];
}

export class BlockHeightPage extends Page {
    static pathname = "/height/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async handle_server(c: Context<ServerApp>) {
        let id = BlockHeightPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        const block_height = parseInt(id);
        this.title = `Block Height ${block_height.toLocaleString()}`;

        try {
            const blocks = await daemon.getBlocksAtHeight({
                height: block_height
            });
            this.server_data = { blocks } as BlockHeightServerData;
        } catch {
            this.status = 404;
        }
    }

    page_data: {
        blocks: Block[]
    }

    master: Master;
    container_table: Container;
    table: Table;

    constructor() {
        super();
        this.page_data = {
            blocks: []
        };

        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-block-height`);

        this.container_table = new Container();
        this.container_table.element.classList.add(`xe-block-height-table`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.table.set_clickable();
        this.container_table.element.appendChild(this.table.element);

        const titles = ["HASH", "TOPOHEIGHT", "BLOCK", "TX COUNT", "SIZE", "REWARD", "POOL / MINER", "AGE"];
        this.table.set_head_row(titles);
    }

    async load_blocks() {
        const server_data = BlockHeightPage.consume_server_data<BlockHeightServerData>();
        const id = BlockHeightPage.get_pattern_id(window.location.href);

        this.page_data = {
            blocks: server_data ? server_data.blocks : []
        }

        try {
            if (id) {
                const block_height = parseInt(id);
                this.set_window_title(`Block Height ${block_height.toLocaleString()}`);

                const node = XelisNode.instance();

                if (this.page_data.blocks.length === 0) {
                    this.page_data.blocks = await node.rpc.getBlocksAtHeight({
                        height: block_height
                    });
                }
            }
        } catch {

        }

        if (this.page_data.blocks.length === 0) {
            const not_found_page = new NotFoundPage();
            this.element.replaceChildren();
            this.element.appendChild(not_found_page.element);
        }
    }

    add_empty_blocks() {
        for (let i = 0; i < 5; i++) {
            const block_row = new BlockRow();
            this.table.set_row_loading(block_row.element, true);
            this.table.prepend_row(block_row.element);
        }
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        this.add_empty_blocks();
        await this.load_blocks();

        const { blocks } = this.page_data;
        this.table.body_element.replaceChildren();
        blocks.forEach((block) => {
            const block_row = new BlockRow();
            block_row.set(block);

            block_row.element.addEventListener(`click`, () => {
                App.instance().go_to(`/block/${block.hash}`);
            });

            this.table.prepend_row(block_row.element);
        });
    }

    unload() {
        super.unload();
    }
}