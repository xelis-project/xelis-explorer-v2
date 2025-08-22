import { Page } from "../page";
import { DashboardBlocks } from "./components/blocks/blocks";
import { Master } from "../../components/master/master";
import { DashboardSearchBlock } from "./components/search_block/search_block";
import { DashboardTopStats } from "./components/top_stats/top_stats";
import { DashboardChartSection1 } from "./components/chart_section_1/chart_section_1";
import { DashboardChartSection2 } from "./components/chart_section_2/chart_section_2";
import { DashboardTxs } from "./components/txs/txs";

import DaemonRPC from '@xelis/sdk/daemon/rpc';
import DaemonWS from '@xelis/sdk/daemon/websocket';
import { Block, Transaction } from "@xelis/sdk/daemon/types";

import './dashboard.css';
import { TxItemData } from "../../components/tx_item/tx_item";
import { XelisNode } from "../../app/xelis_node";

export class DashboardPage extends Page {
    static pathname = "/";
    static title = "Dashboard";

    top_stats: DashboardTopStats;
    blocks: DashboardBlocks;
    txs: DashboardTxs;
    search_block: DashboardSearchBlock;
    chart_section_1: DashboardChartSection1;
    chart_section_2: DashboardChartSection2;

    master: Master;

    constructor() {
        super();
        this.master = new Master();
        this.element.appendChild(this.master.element);

        this.master.content.classList.add(`xe-dashboard`);

        this.top_stats = new DashboardTopStats();
        this.master.content.appendChild(this.top_stats.container.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-dashboard-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        sub_container_1.classList.add(`xe-dashboard-sub-container-1`);
        container_1.appendChild(sub_container_1);

        this.search_block = new DashboardSearchBlock();
        sub_container_1.appendChild(this.search_block.container.element);

        this.chart_section_1 = new DashboardChartSection1();
        sub_container_1.appendChild(this.chart_section_1.container.element);

        this.chart_section_2 = new DashboardChartSection2();
        sub_container_1.appendChild(this.chart_section_2.container.element);

        const sub_container_2 = document.createElement(`div`);
        sub_container_2.classList.add(`xe-dashboard-sub-container-2`);
        container_1.appendChild(sub_container_2);

        this.blocks = new DashboardBlocks();
        sub_container_2.appendChild(this.blocks.container.element);

        this.txs = new DashboardTxs();
        sub_container_2.appendChild(this.txs.container.element);
    }

    async listen_to_update() {
        const node = XelisNode.instance();
        node.ws.methods.onNewBlock(() => {

        });

        node.ws.methods.onTransactionAddedInMempool(() => {

        });
    }

    async load_data() {
        const node = XelisNode.instance();
        this.blocks.set_loading();
        this.txs.set_loading();
        this.top_stats.set_loading(true);

        const info = await node.rpc.getInfo();
        const size = await node.rpc.getSizeOnDisk();
        const p2p_status = await node.rpc.p2pStatus();
        this.top_stats.load({ info, size, p2p_status });

        const blocks = await node.rpc.getBlocksRangeByTopoheight({
            start_topoheight: info.topoheight - 20,
            end_topoheight: info.topoheight
        });

        blocks.sort((a, b) => b.height - a.height);

        this.chart_section_2.hashrate.load(blocks); ``

        let tx_hashes: { block: Block, tx_hash: string, tx?: Transaction }[] = [];
        blocks.map(block => {
            block.txs_hashes.forEach(tx_hash => {
                tx_hashes.push({ block, tx_hash });
            });
        });

        const tx_items: TxItemData[] = [];
        const txs = await node.rpc.getTransactions(tx_hashes.map(x => x.tx_hash).slice(0, 20));
        txs.forEach(tx => {
            const tx_item = tx_hashes.find(x => tx.hash === x.tx_hash);
            if (tx_item) tx_items.push({ block: tx_item.block, tx });
        });

        this.blocks.load(blocks);
        this.txs.load(tx_items);
    }

    load(parent: HTMLElement) {
        super.load(parent);

        this.load_data();
        this.set_window_title(DashboardPage.title);
    }
}