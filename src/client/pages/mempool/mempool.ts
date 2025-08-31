import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
// import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";
// import { fetch_txs_blocks } from "../../fetch_helpers/fetch_blocks_txs";
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

    constructor() {
        super();
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

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(MempoolPage.title);

        this.mempool_txs_list.set_loading();

        const node = XelisNode.instance();
        const res = await node.rpc.getMemPool();
        console.log(res);

        const info = await node.rpc.getInfo();

      //  const blocks = await fetch_blocks(info.height, 5);
       // console.log(blocks)
      //  const txs_blocks = await fetch_txs_blocks(blocks);
      //console.log(txs_blocks)
       // this.mempool_txs_list.set(txs_blocks);
        //this.mempool_chart.txs_transfers.build_chart(txs_blocks);
    }
}