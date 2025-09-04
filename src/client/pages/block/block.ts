import { Context } from "hono";
import { App } from "../../../server";
import { Page } from "../page";
import { Block, GetInfoResult, RPCEvent as DaemonRPCEvent } from "@xelis/sdk/daemon/types";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { NotFoundPage } from "../not_found/not_found";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { BlockInfo } from "./components/info/info";
import { BlockMiner } from "./components/miner/miner";
import { BlockHashrate } from "./components/hashrate/hashrate";
import { BlockExtra } from "./components/extra/extra";
import { BlockTxs } from "./components/txs/txs";
import { BlockGraph } from "./components/graph/graph";

import './block.css';

export interface BlockPageServerData {
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

    page_data: {
        block?: Block;
    }
    master: Master;
    block_info: BlockInfo;
    block_miner: BlockMiner;
    block_hashrate: BlockHashrate;
    block_extra: BlockExtra;
    block_graph: BlockGraph;
    block_txs: BlockTxs;

    constructor() {
        super();
        this.page_data = {};
        this.master = new Master();
        this.master.content.classList.add(`xe-block`);
        this.element.appendChild(this.master.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-block-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.block_info = new BlockInfo();
        sub_container_1.appendChild(this.block_info.container.element);
        this.block_miner = new BlockMiner();
        sub_container_1.appendChild(this.block_miner.container.element);
        this.block_hashrate = new BlockHashrate();
        sub_container_1.appendChild(this.block_hashrate.container.element);
        this.block_extra = new BlockExtra();
        sub_container_1.appendChild(this.block_extra.container.element);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.block_graph = new BlockGraph();
        sub_container_2.appendChild(this.block_graph.container.element);

        this.block_txs = new BlockTxs();
        this.master.content.appendChild(this.block_txs.container.element);
    }

    async load_block() {
        const { server_data, consumed } = BlockPage.consume_server_data<BlockPageServerData>();
        const id = BlockPage.get_pattern_id(window.location.href);

        this.page_data = {
            block: server_data ? server_data.block : undefined
        };

        try {
            if (!consumed && id) {
                const block_hash = id;
                this.set_window_title(`Block ${block_hash}`);

                const node = XelisNode.instance();

                if (!this.page_data.block) {
                    this.page_data.block = await node.rpc.getBlockByHash({
                        hash: block_hash
                    });
                }
            }
        } catch {

        }
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block);

        const node = XelisNode.instance();

        const { block } = this.page_data;
        if (block && new_block) {
            this.block_info.set_confirmations(block.height, new_block.height);
            this.block_info.set_last_update();

            const stable_height = await node.ws.methods.getStableHeight();

            if (block.height >= stable_height) {
                this.page_data.block = await node.ws.methods.getBlockByHash({
                    hash: block.hash
                });

                const info = await node.ws.methods.getInfo();
                this.block_info.set(this.page_data.block, info);
            }
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    set_loading(loading: boolean) {
        this.block_miner.set_loading(loading);
        this.block_hashrate.set_loading(loading);
        this.block_info.set_loading(loading);
        this.block_extra.set_loading(loading);
        this.block_graph.set_loading(loading);
        if (loading) this.block_txs.table.set_loading(5);
    }

    set(block: Block, info: GetInfoResult) {
        this.block_info.set(block, info);
        this.block_miner.set(block);
        this.block_hashrate.set(block, info);
        this.block_extra.set(block);
        this.block_graph.set(block);
        this.block_txs.load(block);
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        this.listen_node_events();

        this.set_loading(true);
        this.block_graph.dag.overlay_loading.set_loading(true);

        await this.load_block();
        
        const node = XelisNode.instance();
        const info = await node.rpc.getInfo();

        this.set_loading(false);
        this.block_graph.dag.overlay_loading.set_loading(false);

        const { block } = this.page_data;
        if (block) {
            this.set_element(this.master.element);
            this.set(block, info);
        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }

    unload(): void {
        super.unload();
        this.clear_node_events();
    }
}