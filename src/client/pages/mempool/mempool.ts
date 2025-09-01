import { Block, RPCEvent as DaemonRPCEvent, MempoolTransactionSummary } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
import { TxBlock } from "../../components/tx_item/tx_item";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";
import { fetch_blocks_txs } from "../../fetch_helpers/fetch_blocks_txs";
import { Page } from "../page";
import { MempoolChart } from "./components/chart/chart";
import { MempoolTxsList } from "./components/list/list";
import { MempoolSearch } from "./components/search/search";
import { MempoolState } from "./components/state/state";

import './mempool.css';

export class MempoolPage extends Page {
    static pathname = "/mempool";
    static title = "Mempool";

    master: Master;

    mempool_state: MempoolState;
    mempool_chart: MempoolChart;
    mempool_txs_list: MempoolTxsList;
    mempool_search: MempoolSearch;

    page_data: {
        blocks: Block[]
    }

    constructor() {
        super();

        this.page_data = {
            blocks: []
        };

        this.master = new Master();
        this.master.content.classList.add(`xe-mempool`);
        this.element.appendChild(this.master.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-mempool-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.mempool_state = new MempoolState();
        sub_container_1.appendChild(this.mempool_state.container.element);

        this.mempool_chart = new MempoolChart();
        sub_container_1.appendChild(this.mempool_chart.container.element);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.mempool_search = new MempoolSearch();
        sub_container_2.appendChild(this.mempool_search.container.element);
        this.mempool_txs_list = new MempoolTxsList();
        sub_container_2.appendChild(this.mempool_txs_list.container.element);
    }


    on_transaction_added_in_mempool = (new_tx?: MempoolTransactionSummary, err?: Error) => {
        if (new_tx) {

        }
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        if (new_block) {
            this.page_data.blocks.unshift();
            this.page_data.blocks.push(new_block);

            this.mempool_chart.blocks_txs.set(this.page_data.blocks);
            this.mempool_state.reset();
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);

    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.socket.addEventListener(`open`, () => {
            node.ws.methods.listen(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
            node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
        });
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(MempoolPage.title);
        this.mempool_txs_list.set_loading();
        this.listen_node_events();

        const node = XelisNode.instance();

        const top_block = await node.rpc.getTopBlock();
        const mempool = await node.rpc.getMemPool();
        const blocks = await fetch_blocks(top_block.height, 50);
        this.page_data.blocks = blocks;

        this.mempool_state.set(mempool, top_block);
        this.mempool_txs_list.set([]);
        this.mempool_chart.blocks_txs.set(blocks);
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}