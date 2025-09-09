import { PeerLocation } from "../../../../components/peers_map/peers_map";
import { Container } from "../../../../components/container/container";
import { PeerItem } from "../../../../components/peer_item/peer_item";
import { PeersPage } from "../../peers";

import './list.css';

export class PeersList {
    container: Container;
    peer_items: PeerItem[];

    element_title: HTMLDivElement;
    element_content: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.peer_items = [];
        this.container.element.classList.add(`xe-peers-list`, `scrollbar-1`, `scrollbar-1-right`);

        this.element_title = document.createElement(`div`);
        this.element_title.innerHTML = `PEERS`;
        this.container.element.appendChild(this.element_title);

        this.element_content = document.createElement(`div`);
        this.container.element.appendChild(this.element_content);
    }

    prepend_peer(peer_location: PeerLocation) {
        const peer_item = new PeerItem();
        peer_item.set(peer_location);

        peer_item.box.element.addEventListener(`click`, () => {
            const { peers_map } = PeersPage.instance();
            const { geo_location } = peer_location;
            peers_map.map.map.flyTo([geo_location.latitude, geo_location.longitude], 6);
        });

        const { country, city } = peer_location.geo_location;
        peer_item.box.element.title = `Fly to ${country} / ${city}`;

        this.peer_items.push(peer_item);
        if (this.is_in_filter(peer_item)) {
            this.element_content.insertBefore(peer_item.box.element, this.element_content.firstChild);
        }
        return peer_item;
    }

    remove_peer(peer_id: string) {
        for (let i = 0; i < this.peer_items.length; i++) {
            const peer_item = this.peer_items[i];
            if (peer_item.data && peer_item.data.peer.id === peer_id) {
                this.peer_items.splice(i, 1);
                peer_item.box.element.remove();
                break;
            }
        }
    }

    set(peers_locations: PeerLocation[]) {
        this.element_content.replaceChildren();
        peers_locations.forEach((peer_location) => {
            this.prepend_peer(peer_location);
        });
    }

    filter_peer_ids = undefined as string[] | undefined;
    is_in_filter(peer_item: PeerItem) {
        if (this.filter_peer_ids) {
            const data = peer_item.data;
            if (data && this.filter_peer_ids && this.filter_peer_ids.length > 0) {
                return this.filter_peer_ids.indexOf(data.peer.id) !== -1;
            }

            return false;
        }

        return true;
    }

    update_filter() {
        this.peer_items.forEach((peer_item) => {
            const parent_element = peer_item.box.element.parentElement;
            if (!this.is_in_filter(peer_item)) {
                peer_item.box.element.remove();
            } else if (!parent_element) {
                this.element_content.insertBefore(peer_item.box.element, this.element_content.firstChild);
            }
        });
    }
}