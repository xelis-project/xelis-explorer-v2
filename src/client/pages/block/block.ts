import { Context } from "hono";
import { App } from "../../../server";
import { Page } from "../page";
import { Block } from "@xelis/sdk/daemon/types";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { NotFoundPage } from "../not_found/not_found";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";

import './block.css';

interface BlockPageServerData {
    block: Block;
}

export class BlockPage extends Page {
    static pathname = "/block/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async handle_server(c: Context<App>) {
        let block_hash = this.get_pattern_id(c.req.url);
        this.title = `Block ${block_hash}`;
        this.server_data = undefined;

        if (!block_hash) {
            this.status = 404;
            return;
        }

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        try {
            const block = await daemon.getBlockByHash({
                hash: block_hash
            });
            this.server_data = { block } as BlockPageServerData;
        } catch {
            this.status = 404;
        }
    }

    block?: Block;
    master: Master;

    constructor() {
        super();
        this.master = new Master();
        this.element.appendChild(this.master.element);
    }

    async load(parent: HTMLElement) {
        const server_data = BlockPage.consume_server_data<BlockPageServerData>();
        const block_hash = BlockPage.get_pattern_id(window.location.href);
        this.set_window_title(`Block ${block_hash}`);

        if (server_data) {
            this.block = server_data.block;
        } else {
            try {
                if (block_hash) {
                    const node = XelisNode.instance();
                    this.block = await node.rpc.getBlockByHash({
                        hash: block_hash
                    });
                }
            } catch {

            }

            if (!this.block) {
                const not_found_page = new NotFoundPage();
                this.element = not_found_page.element;
            }
        }

        super.load(parent);
    }
}