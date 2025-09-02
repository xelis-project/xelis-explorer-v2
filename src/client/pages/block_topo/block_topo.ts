import { Page } from "../page";
import { Context } from "hono";
import { App } from "../../../server";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { XelisNode } from "../../app/xelis_node";
import { BlockPage, BlockPageServerData } from "../block/block";
import { NotFoundPage } from "../not_found/not_found";

export class BlockTopoPage extends Page {
    static pathname = "/topo/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async handle_server(c: Context<App>) {
        let id = BlockTopoPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        const block_topoheight = parseInt(id);
        this.title = `Block Topo ${block_topoheight.toLocaleString()}`;

        try {
            const block = await daemon.getBlockAtTopoheight({
                topoheight: block_topoheight
            });
            this.server_data = { block } as BlockPageServerData;
        } catch {
            this.status = 404;
        }
    }

    block_page: BlockPage;
    constructor() {
        super();
        this.block_page = new BlockPage();
        this.element = this.block_page.element;
    }

    async load_block() {
        const { server_data, consumed } = BlockTopoPage.consume_server_data<BlockPageServerData>();
        const id = BlockTopoPage.get_pattern_id(window.location.href);

        this.block_page.page_data = {
            block: server_data ? server_data.block : undefined
        };

        try {
            if (!consumed && id) {
                const block_topoheight = parseInt(id);
                this.set_window_title(`Block Topo ${block_topoheight.toLocaleString()}`);

                const node = XelisNode.instance();

                if (!this.block_page.page_data.block) {
                    this.block_page.page_data.block = await node.rpc.getBlockAtTopoheight({
                        topoheight: block_topoheight
                    });
                }
            }
        } catch {

        }
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        this.block_page.listen_node_events();
        await this.load_block();

        const node = XelisNode.instance();
        const info = await node.rpc.getInfo();
        const { block } = this.block_page.page_data;
        if (block) {
            this.set_element(this.block_page.element);
            this.block_page.set(block, info);
        } else {
            const not_found_page = new NotFoundPage();
            this.set_element(not_found_page.element);
        }
    }

    unload() {
        super.unload();
        this.block_page.clear_node_events();
    }
}