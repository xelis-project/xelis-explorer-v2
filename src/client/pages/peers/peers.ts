import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
import { PeersMap } from "../../components/peers_map/peers_map";
import { Page } from "../page";

import './peers.css';

export class PeersPage extends Page {
    static pathname = "/peers";
    static title = "Peers";

    master: Master;
    peers_map: PeersMap;

    constructor() {
        super();
        this.master = new Master();
        this.master.content.classList.add(`xe-peers`);
        this.element.appendChild(this.master.element);

        this.peers_map = new PeersMap();
        this.peers_map.element.classList.add(`xe-peers-map`);
        this.master.content.appendChild(this.peers_map.element);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(PeersPage.title);

        const node = XelisNode.instance();

        this.peers_map.set_loading(true);
        const peers_result = await node.rpc.getPeers();
        await this.peers_map.load(peers_result.peers);
        this.peers_map.set_loading(false);
    }
}