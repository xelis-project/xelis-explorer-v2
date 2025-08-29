import { Page } from "../page";
import { DashboardBlocks } from "./components/blocks/blocks";
import { Master } from "../../components/master/master";
import { DashboardSearch } from "./components/search/search";
import { DashboardTopStats } from "./components/top_stats/top_stats";
import { DashboardChartSection1 } from "./components/chart_section_1/chart_section_1";
import { DashboardChartSection2 } from "./components/chart_section_2/chart_section_2";
import { DashboardTxs } from "./components/txs/txs";
import { BlockOrdered, BlockOrphaned, BlockType, RPCEvent as DaemonRPCEvent, DiskSize, GetInfoResult, P2PStatusResult, RPCMethod, TopoheightRangeParams } from '@xelis/sdk/daemon/types';
import { Block, MempoolTransactionSummary, Transaction } from "@xelis/sdk/daemon/types";
import { TxBlock } from "../../components/tx_item/tx_item";
import { XelisNode } from "../../app/xelis_node";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { DashboardPeers } from "./components/peers/peers";
import { DashboardDAG } from "./components/dag/dag";

import './dashboard.css';

export class DashboardPage extends Page {
    static pathname = "/";
    static title = "Dashboard";

    dashboard_top_stats: DashboardTopStats;
    dashboard_blocks: DashboardBlocks;
    dashboard_txs: DashboardTxs;
    dashboard_search: DashboardSearch;
    dashboard_chart_section_1: DashboardChartSection1;
    dashboard_chart_section_2: DashboardChartSection2;
    dashboard_peers: DashboardPeers;
    dashboard_dag: DashboardDAG;

    page_data: {
        info?: GetInfoResult;
        size?: DiskSize;
        p2p_status?: P2PStatusResult;
        blocks: Block[];
        txs_block: TxBlock[];
    }

    master: Master;

    constructor() {
        super();

        this.page_data = {
            blocks: [],
            txs_block: []
        };

        this.master = new Master();
        this.element.appendChild(this.master.element);

        this.master.content.classList.add(`xe-dashboard`);

        this.dashboard_top_stats = new DashboardTopStats();
        this.master.content.appendChild(this.dashboard_top_stats.container.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-dashboard-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        sub_container_1.classList.add(`xe-dashboard-sub-container-1`);
        container_1.appendChild(sub_container_1);

        this.dashboard_search = new DashboardSearch();
        sub_container_1.appendChild(this.dashboard_search.container.element);

        this.dashboard_chart_section_1 = new DashboardChartSection1();
        sub_container_1.appendChild(this.dashboard_chart_section_1.container.element);

        this.dashboard_chart_section_2 = new DashboardChartSection2();
        sub_container_1.appendChild(this.dashboard_chart_section_2.container.element);

        this.dashboard_peers = new DashboardPeers();
        sub_container_1.appendChild(this.dashboard_peers.container.element);

        this.dashboard_dag = new DashboardDAG();
        sub_container_1.appendChild(this.dashboard_dag.container.element);

        const sub_container_2 = document.createElement(`div`);
        sub_container_2.classList.add(`xe-dashboard-sub-container-2`);
        container_1.appendChild(sub_container_2);

        this.dashboard_blocks = new DashboardBlocks();
        sub_container_2.appendChild(this.dashboard_blocks.container.element);

        this.dashboard_txs = new DashboardTxs();
        sub_container_2.appendChild(this.dashboard_txs.container.element);
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block)

        this.load_top_stats();
        if (new_block) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === new_block.hash);
            if (!block_item) {
                this.dashboard_blocks.prepend_block(new_block).animate_prepend();
                this.dashboard_blocks.remove_last_block();
                this.dashboard_txs.remove_block_txs(new_block.hash);

                const tx_items = await this.build_txs_block(new_block);
                tx_items.forEach((tx_item) => {
                    this.dashboard_txs.prepend_tx(tx_item);
                });

                const blocks = this.dashboard_blocks.block_items.map(x => x.data!);
                this.dashboard_chart_section_2.hashrate.update();
                this.dashboard_chart_section_2.block_time.update();
            } else {
                block_item.set(new_block);
                block_item.animate_update();
            }
        }
    }

    on_transaction_added_in_mempool = (new_tx?: MempoolTransactionSummary, err?: Error) => {
        const info = this.page_data.info;
        if (info && new_tx) {
            info.mempool_size += 1;
            this.dashboard_top_stats.set_mempool(info.mempool_size);
        }
    }

    on_block_ordered = (block_ordered?: BlockOrdered | undefined, err?: Error) => {
        console.log("block_ordered", block_ordered)
        if (block_ordered) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === block_ordered.block_hash);
            if (block_item && block_item.data && block_item.data.hash === block_ordered.block_hash) {
                const new_block_type = block_ordered.block_type as BlockType;
                block_item.data.block_type = new_block_type;
                block_item.set_type(new_block_type);
                block_item.data.topoheight = block_ordered.topoheight;
                block_item.animate_update();
            }
        }
    }

    on_block_orphaned = (block_orphaned?: BlockOrphaned | undefined, err?: Error) => {
        console.log("block_orphaned", block_orphaned)
        if (block_orphaned) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === block_orphaned.block_hash);
            if (block_item && block_item.data && block_item.data.hash === block_orphaned.block_hash) {
                const new_block_type = BlockType.Orphaned;
                block_item.data.block_type = new_block_type;
                block_item.set_type(new_block_type);
                block_item.animate_update();
            }
        }
    }

    on_peer_connected = () => {
        console.log("peer_connected");
        const p2p_status = this.page_data.p2p_status;
        if (p2p_status) {
            p2p_status.peer_count += 1;
            this.dashboard_top_stats.set_peers(p2p_status.peer_count);
        }
    }

    on_peer_disconnected = () => {
        console.log("peer_disconnected")
        const p2p_status = this.page_data.p2p_status;
        if (p2p_status) {
            p2p_status.peer_count -= 1;
            this.dashboard_top_stats.set_peers(p2p_status.peer_count);
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
        node.ws.methods.closeListener(DaemonRPCEvent.BlockOrphaned, this.on_block_orphaned);
        node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
        node.ws.methods.closeListener(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
        node.ws.methods.closeListener(DaemonRPCEvent.PeerConnected, this.on_peer_connected);
        node.ws.methods.closeListener(DaemonRPCEvent.PeerDisconnected, this.on_peer_disconnected);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.socket.addEventListener(`open`, () => {
            node.ws.methods.listen(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
            node.ws.methods.listen(DaemonRPCEvent.BlockOrphaned, this.on_block_orphaned);
            node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
            node.ws.methods.listen(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
            node.ws.methods.listen(DaemonRPCEvent.PeerConnected, this.on_peer_connected);
            node.ws.methods.listen(DaemonRPCEvent.PeerDisconnected, this.on_peer_disconnected);
        });
    }

    async load_top_stats() {
        const node = XelisNode.instance();

        const info = await node.rpc.getInfo();
        const size = await node.rpc.getSizeOnDisk();
        const p2p_status = await node.rpc.p2pStatus();
        this.dashboard_top_stats.load({ info, size, p2p_status });
        this.page_data.info = info;
        this.page_data.size = size;
        this.page_data.p2p_status = p2p_status;
        this.dashboard_chart_section_2.hashrate.set_hashrate(info);
    }

    async load_blocks() {
        const node = XelisNode.instance();

        const info = this.page_data.info;
        if (!info) return;

        const requests = [] as RPCRequest[];
        for (let i = 0; i < 2; i++) {
            requests.push({
                method: RPCMethod.GetBlocksRangeByTopoheight,
                params: {
                    start_topoheight: info.topoheight - (i * 20 + 20),
                    end_topoheight: info.topoheight - (i * 20)
                } as TopoheightRangeParams
            });
        }

        let blocks = [] as Block[];
        const res = await node.rpc.batchRequest(requests);
        res.forEach(result => {
            if (result instanceof Error) {
                console.log(result)
            } else {
                blocks = [...blocks, ...result as Block[]];
            }
        });
        blocks.sort((a, b) => a.height - b.height);

        /*const blocks = await node.rpc.getBlocksRangeByHeight({
            start_height: info.height - 20,
            end_height: info.height
        });*/

        //blocks.sort((a, b) => b.height - a.height);

        this.page_data.blocks = blocks;
        this.dashboard_chart_section_2.hashrate.update();
        this.dashboard_chart_section_2.block_time.update();
        this.dashboard_chart_section_2.pools.update();
        this.dashboard_blocks.update();
    }

    async build_txs_block(block: Block) {
        const node = XelisNode.instance();
        const txs_block: TxBlock[] = [];

        const tx_count = block.txs_hashes.length;
        for (let i = 0; i < tx_count; i += 20) {
            const tx_hashes = block.txs_hashes.slice(i, 20);
            const txs = await node.rpc.getTransactions(tx_hashes);
            txs.forEach(tx => txs_block.push({ block, tx }));
        }
        return txs_block;
    }

    async load_blocks_txs() {
        const node = XelisNode.instance();
        const blocks = this.page_data.blocks;
        if (!blocks) return;

        let tx_hashes: { block: Block, tx_hash: string, tx?: Transaction }[] = [];
        blocks.map(block => {
            block.txs_hashes.forEach(tx_hash => {
                tx_hashes.push({ block, tx_hash });
            });
        });

        const txs_block: TxBlock[] = [];
        const txs = await node.rpc.getTransactions(tx_hashes.map(x => x.tx_hash).slice(0, 20));
        txs.forEach(tx => {
            const tx_block = tx_hashes.find(x => tx.hash === x.tx_hash);
            if (tx_block) txs_block.push({ block: tx_block.block, tx });
        });
        this.page_data.txs_block = txs_block;

        this.dashboard_txs.update();
    }

    async load_peers() {
        const node = XelisNode.instance();
        const peers_result = await node.rpc.getPeers();
        this.dashboard_peers.peers_map.set(peers_result.peers);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(DashboardPage.title);

        this.listen_node_events();

        this.dashboard_top_stats.set_loading(true);
        this.dashboard_blocks.set_loading();
        this.dashboard_txs.set_loading();

        this.load_peers();

        await this.load_top_stats()
        await this.load_blocks();
        this.load_blocks_txs();
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}