import { Page } from "../page";
import { DashboardBlocks } from "./components/blocks/blocks";
import { Master } from "../../components/master/master";
import { DashboardSearch } from "./components/search/search";
import { DashboardTopStats } from "./components/top_stats/top_stats";
import { DashboardChartSection1 } from "./components/chart_section_1/chart_section_1";
import { DashboardChartSection2 } from "./components/chart_section_2/chart_section_2";
import { DashboardTxs } from "./components/txs/txs";
import { BlockOrdered, BlockOrphaned, BlockType, RPCEvent as DaemonRPCEvent, DiskSize, GetInfoResult, P2PStatusResult, Peer } from '@xelis/sdk/daemon/types';
import { Block, MempoolTransactionSummary } from "@xelis/sdk/daemon/types";
import { TxBlock } from "../../components/tx_item/tx_item";
import { XelisNode } from "../../app/xelis_node";
import { DashboardPeers } from "./components/peers/peers";
import { DashboardDAG } from "./components/dag/dag";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";
import { fetch_blocks_txs } from "../../fetch_helpers/fetch_blocks_txs";
import { parse_addr } from "../../utils/parse_addr";
import { fetch_geo_location } from "../../utils/fetch_geo_location";
import { PeerLocation } from "../../components/peers_map/peers_map";

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
        txs_blocks: TxBlock[];
    }

    master: Master;

    constructor() {
        super();

        this.page_data = {
            blocks: [],
            txs_blocks: []
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
        container_1.appendChild(sub_container_2);

        this.dashboard_blocks = new DashboardBlocks();
        sub_container_2.appendChild(this.dashboard_blocks.container.element);

        this.dashboard_txs = new DashboardTxs();
        sub_container_2.appendChild(this.dashboard_txs.container.element);
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block)

        if (new_block) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === new_block.hash);
            if (!block_item) {
                this.dashboard_blocks.prepend_block(new_block).animate_prepend();
                this.dashboard_blocks.remove_last_block();
                this.dashboard_txs.remove_block_txs(new_block.hash);

                const update_txs = async () => {
                    // we don't need to fetch txs, new_block should already have them
                    // await fetch_block_txs(new_block);
                    if (new_block.transactions) {
                        new_block.transactions.forEach((tx) => {
                            this.dashboard_txs.prepend_tx({ block: new_block, tx });
                        });
                    }
                }

                update_txs();

                this.page_data.blocks = this.dashboard_blocks.block_items.map(x => x.data!);
                await this.load_top_stats();
                const { info, blocks } = this.page_data;
                this.dashboard_chart_section_2.pools.set(blocks);
                if (info) {
                    this.dashboard_chart_section_2.hashrate.set(info, blocks);
                    this.dashboard_chart_section_2.block_time.set(info, blocks);
                }
            } else {
                block_item.set(new_block);
                block_item.animate_update();
            }

            const node = XelisNode.instance();
            const stable_height = await node.ws.methods.getStableHeight();

            // normal blocks become sync under stableheight
            // the node does not emit an event for this case
            const side_block_heights = this.dashboard_blocks.block_items.filter(b => {
                if (b.data && b.data.block_type === BlockType.Side) {
                    return b;
                }
            }).map(b => b.data!.height);

            this.dashboard_blocks.block_items.forEach((block_item) => {
                const block = block_item.data;
                if (block &&
                    block.height <= stable_height
                    && block.block_type === BlockType.Normal
                    && side_block_heights.indexOf(block.height) === -1
                ) {
                    block.block_type = BlockType.Sync;
                    block_item.set_type(BlockType.Sync);
                    block_item.animate_update();
                }
            });
        }
    }

    on_transaction_added_in_mempool = (new_tx?: MempoolTransactionSummary, err?: Error) => {
        const info = this.page_data.info;
        if (info && new_tx) {
            info.mempool_size += 1;
            this.dashboard_top_stats.set_mempool(info.mempool_size);
        }
    }

    on_block_ordered = async (block_ordered?: BlockOrdered | undefined, err?: Error) => {
        console.log("block_ordered", block_ordered);
        if (block_ordered) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === block_ordered.block_hash);
            if (block_item && block_item.data) {
                // refetch block instead of using data from block_ordered
                // block can pass from orphaned to normal, sync
                // other attributes can also change
                const node = XelisNode.instance();
                const block = await node.ws.methods.getBlockByHash({ hash: block_ordered.block_hash });
                block_item.set(block);
                block_item.animate_update();
            }
        }
    }

    on_block_orphaned = (block_orphaned?: BlockOrphaned | undefined, err?: Error) => {
        console.log("block_orphaned", block_orphaned);
        if (block_orphaned) {
            const block_item = this.dashboard_blocks.block_items.find(b => b.data && b.data.hash === block_orphaned.block_hash);
            if (block_item && block_item.data) {
                const new_block_type = BlockType.Orphaned;
                block_item.data.block_type = new_block_type;
                block_item.set_type(new_block_type);
                block_item.animate_update();
            }
        }
    }

    on_peer_connected = async (new_peer?: Peer, err?: Error) => {
        console.log("peer_connected");
        const p2p_status = this.page_data.p2p_status;
        if (p2p_status) {
            p2p_status.peer_count += 1;
            this.dashboard_top_stats.set_peers(p2p_status.peer_count);
        }

        if (new_peer) {
            const addr = parse_addr(new_peer.addr);
            const res = await fetch_geo_location([addr.ip]);
            const geo_location = res[addr.ip];

            const peer_location = { peer: new_peer, geo_location } as PeerLocation;
            this.dashboard_peers.peers_map.add_peer_marker(peer_location);
        }
    }

    on_peer_disconnected = (peer_id?: string, err?: Error) => {
        console.log("peer_disconnected");
        const p2p_status = this.page_data.p2p_status;
        if (p2p_status) {
            p2p_status.peer_count -= 1;
            this.dashboard_top_stats.set_peers(p2p_status.peer_count);
        }

        if (peer_id) {
            this.dashboard_peers.peers_map.remove_peer_marker(peer_id);
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
        node.ws.methods.listen(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
        node.ws.methods.listen(DaemonRPCEvent.BlockOrphaned, this.on_block_orphaned);
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
        node.ws.methods.listen(DaemonRPCEvent.TransactionAddedInMempool, this.on_transaction_added_in_mempool);
        node.ws.methods.listen(DaemonRPCEvent.PeerConnected, this.on_peer_connected);
        node.ws.methods.listen(DaemonRPCEvent.PeerDisconnected, this.on_peer_disconnected);
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
        const info = this.page_data.info;
        if (!info) return;

        const blocks = await fetch_blocks(info.height, 100);

        this.page_data.blocks = blocks;
        this.dashboard_chart_section_2.hashrate.set(info, blocks);
        this.dashboard_chart_section_2.block_time.set(info, blocks);
        this.dashboard_chart_section_2.pools.set(blocks);
        this.dashboard_blocks.set(blocks);
    }

    async load_blocks_txs() {
        const blocks = this.page_data.blocks;
        if (!blocks) return;

        await fetch_blocks_txs(blocks);

        const txs_blocks: TxBlock[] = [];
        blocks.forEach((block) => {
            if (block.transactions) {
                block.transactions.forEach((tx) => {
                    txs_blocks.push({ block, tx });
                });
            }
        });

        this.page_data.txs_blocks = txs_blocks;
        this.dashboard_txs.set(txs_blocks);
    }

    async load_peers() {
        const node = XelisNode.instance();
        this.dashboard_peers.peers_map.overlay_loading.set_loading(true);
        const peers_result = await node.rpc.getPeers();
        const peers_locations = await this.dashboard_peers.peers_map.fetch_peers_locations(peers_result.peers);
        this.dashboard_peers.peers_map.set(peers_locations);
        this.dashboard_peers.peers_map.overlay_loading.set_loading(false);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(DashboardPage.title);

        this.listen_node_events();

        this.dashboard_top_stats.container.box_loading(true);
        this.dashboard_blocks.container.list_loading(20, `5rem`);
        this.dashboard_txs.container.list_loading(20, `5rem`);
        this.dashboard_chart_section_2.container.box_loading(true);

        this.load_peers();

        await this.load_top_stats()

        this.dashboard_top_stats.container.box_loading(false);

        await this.load_blocks();
        this.load_blocks_txs();

        this.dashboard_chart_section_2.container.box_loading(false);
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}