import { Container } from "../../../../components/container/container";
import { PeersMap as PeersMapComponent } from "../../../../components/peers_map/peers_map";

import './map.css';

export class PeersMap {
    container: Container;
    map: PeersMapComponent;

    constructor() {
        this.container = new Container();

        this.map = new PeersMapComponent();
        this.map.element.classList.add(`xe-peers-map`);
        this.container.element.appendChild(this.map.element);
    }
}