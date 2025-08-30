import { PeerLocation } from "../../../../components/peers_map/peers_map";
import { Container } from "../../../../components/container/container";
import { PeerItem } from "../../../../components/peer_item/peer_item";

import './list.css';

export class PeersList {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-peers-list`, `scrollbar-1`, `scrollbar-1-right`);
    }

    set_loading() {
        for (let i = 0; i < 20; i++) {
            this.add_empty_block();
        }
    }

    add_empty_block() {
        const peer_item = new PeerItem();
        peer_item.box.set_loading(true);
        this.container.element.appendChild(peer_item.box.element);
    }

    set(peers: PeerLocation[]) {
        this.container.element.replaceChildren();
        peers.forEach((peer) => {
            const peer_item = new PeerItem();
            peer_item.set(peer);
            this.container.element.appendChild(peer_item.box.element);
        });
    }
}