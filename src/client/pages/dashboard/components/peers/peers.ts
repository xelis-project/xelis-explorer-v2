import { localization } from "../../../../localization/localization";
import { Container } from "../../../../components/container/container";
import { PeersMap } from "../../../../components/peers_map/peers_map";

import './peers.css';

export class DashboardPeers {
    container: Container;
    peers_map: PeersMap;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-peers`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`PEERS`);
        this.container.element.appendChild(title_element);

        this.peers_map = new PeersMap();
        this.peers_map.element.classList.add(`xe-dashboard-peers-map`);
        this.container.element.appendChild(this.peers_map.element);
    }
}