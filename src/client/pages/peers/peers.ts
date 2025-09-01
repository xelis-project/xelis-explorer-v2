import { XelisNode } from "../../app/xelis_node";
import { RPCEvent as DaemonRPCEvent, Peer } from "@xelis/sdk/daemon/types";
import { Master } from "../../components/master/master";
import { PeersMap } from "./components/map/map";
import { Page } from "../page";
import { PeersInfo } from "./components/info/info";
import { PeersSearch } from "./components/search/search";
import { PeersList } from "./components/list/list";
import { PeersChart } from "./components/chart/chart";
import { fetch_geo_location } from "../../utils/fetch_geo_location";
import { parse_addr } from "../../utils/parse_addr";
import { PeerLocation } from "../../components/peers_map/peers_map";

import './peers.css';

export class PeersPage extends Page {
    static pathname = "/peers";
    static title = "Peers";

    master: Master;

    peers_map: PeersMap;
    peers_chart: PeersChart;

    peers_info: PeersInfo;
    peers_search: PeersSearch;
    peers_list: PeersList;

    constructor() {
        super();
        this.master = new Master();
        this.master.content.classList.add(`xe-peers`);
        this.element.appendChild(this.master.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-peers-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.peers_map = new PeersMap();
        sub_container_1.appendChild(this.peers_map.container.element);

        this.peers_chart = new PeersChart();
        sub_container_1.appendChild(this.peers_chart.container.element);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.peers_info = new PeersInfo();
        sub_container_2.appendChild(this.peers_info.container.element);

        this.peers_search = new PeersSearch();
        sub_container_2.appendChild(this.peers_search.container.element);

        this.peers_list = new PeersList();
        sub_container_2.appendChild(this.peers_list.container.element);
    }

    on_peer_connected = async (new_peer?: Peer, err?: Error) => {
        console.log("peer_connected");

        if (new_peer) {
            const addr = parse_addr(new_peer.addr);
            const res = await fetch_geo_location([addr.ip]);
            const geo_location = res[addr.ip];

            const peer_location = { peer: new_peer, geo_location } as PeerLocation;
            this.peers_map.map.add_peer_marker(peer_location);
            this.peers_list.prepend_peer(peer_location);
        }
    }

    on_peer_disconnected = (peer_id?: string, err?: Error) => {
        console.log("peer_disconnected")
        if (peer_id) {
            this.peers_map.map.remove_peer_marker(peer_id);
            this.peers_list.remove_peer(peer_id);
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.PeerConnected, this.on_peer_connected);
        node.ws.methods.closeListener(DaemonRPCEvent.PeerDisconnected, this.on_peer_disconnected);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.PeerConnected, this.on_peer_connected);
        node.ws.methods.listen(DaemonRPCEvent.PeerDisconnected, this.on_peer_disconnected);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(PeersPage.title);

        const node = XelisNode.instance();

        this.listen_node_events();

        this.peers_map.map.set_loading(true);
        this.peers_chart.set_loading(true);
        this.peers_list.set_loading();
        this.peers_info.set_loading(true);

        const info = await node.rpc.getInfo();

        const peers_result = await node.rpc.getPeers();
        const { peers } = peers_result;

        const peers_locations = await this.peers_map.map.fetch_peers_locations(peers);
        this.peers_map.map.set(peers_locations);
        this.peers_map.map.set_loading(false);
        this.peers_chart.set_loading(false);
        this.peers_info.set_loading(false);

        this.peers_info.set(peers, info.height);
        this.peers_list.set(peers_locations);

        this.peers_chart.nodes_by_version.build_chart(peers);
        this.peers_chart.nodes_by_height.build_chart(peers);
        this.peers_chart.nodes_by_country.build_chart(peers_locations);
    }
}