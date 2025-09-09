import { Block, RPCEvent as DaemonRPCEvent, MempoolTransactionSummary, Transaction } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
import { TxBlock } from "../../components/tx_item/tx_item";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";
import { Page } from "../page";
import { MempoolChart } from "./components/chart/chart";
import { MempoolTxsList } from "./components/list/list";
import { MempoolSearch } from "./components/search/search";
import { MempoolSummary } from "./components/summary/summary";

import './mempool.css';
import { Box } from "../../components/box/box";

export class MempoolPage extends Page {
    static pathname = "/mempool";
    static title = "Mempool";

    master: Master;

    mempool_summary: MempoolSummary;
    mempool_chart: MempoolChart;
    mempool_txs_list: MempoolTxsList;
    mempool_search: MempoolSearch;

    page_data: {
        top_block?: Block;
        blocks: Block[];
        mempool_txs: Transaction[];
    }

    constructor() {
        super();

        this.page_data = {
            blocks: [],
            mempool_txs: []
        };

        this.master = new Master();
        this.master.content.classList.add(`xe-mempool`);
        this.element.appendChild(this.master.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-mempool-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.mempool_summary = new MempoolSummary();
        sub_container_1.appendChild(this.mempool_summary.container.element);

        this.mempool_chart = new MempoolChart();
        sub_container_1.appendChild(this.mempool_chart.container.element);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.mempool_search = new MempoolSearch();
        sub_container_2.appendChild(this.mempool_search.container.element);
        this.mempool_txs_list = new MempoolTxsList();
        sub_container_2.appendChild(this.mempool_txs_list.container.element);
    }


    on_transaction_added_in_mempool = async (new_tx?: MempoolTransactionSummary, err?: Error) => {
        if (new_tx) {
            const top_block = this.page_data.top_block;

            if (top_block) {
                const future_block = { height: top_block.height + 1, timestamp: new_tx.first_seen } as Block;

                const node = XelisNode.instance();
                const tx = await node.ws.methods.getTransaction(new_tx.hash);

                this.page_data.mempool_txs.push(tx);

                const tx_block = { tx: tx, block: future_block } as TxBlock;
                this.mempool_txs_list.prepend_tx(tx_block);
                this.mempool_summary.set(this.page_data.mempool_txs, top_block);
            }
        }
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        if (new_block) {
            const { blocks, mempool_txs } = this.page_data;
            blocks.shift();
            blocks.push(new_block);

            this.page_data.mempool_txs = [];
            this.mempool_txs_list.set([]);
            this.mempool_chart.blocks_txs.set(this.page_data.blocks);
            this.mempool_summary.set(mempool_txs, new_block);
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(MempoolPage.title);
        Box.boxes_loading(this.mempool_chart.container.element, true);
        Box.boxes_loading(this.mempool_summary.container.element, true);
        Box.list_loading(this.mempool_txs_list.container.element, 5, `5rem`);
        this.listen_node_events();

        const node = XelisNode.instance();

        const top_block = await node.rpc.getTopBlock();
        this.page_data.top_block = top_block;

        const mempool_txs = await node.rpc.getMemPool();
        this.page_data.mempool_txs = mempool_txs.transactions;

        const blocks = await fetch_blocks(top_block.height, 25);
        this.page_data.blocks = blocks;

        this.mempool_summary.set(this.page_data.mempool_txs, top_block);
        this.mempool_txs_list.set(this.page_data.mempool_txs as any);
        this.mempool_chart.blocks_txs.set(blocks);

        Box.boxes_loading(this.mempool_summary.container.element, false);
        Box.boxes_loading(this.mempool_chart.container.element, false);
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}