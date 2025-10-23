import { Container } from "../../../../components/container/container";
import { PeersChartNodesByCountry } from "./nodes_by_country";
import { PeersChartNodesByHeight } from "./nodes_by_height";
import { PeersChartNodesByVersion } from "./nodes_by_version";

import './chart.css';

export class PeersChart {
    container: Container;

    nodes_by_version: PeersChartNodesByVersion;
    nodes_by_height: PeersChartNodesByHeight;
    nodes_by_country: PeersChartNodesByCountry;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-peers-chart`);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-peers-chart-container-1`);
        this.container.element.appendChild(container_1);

        this.nodes_by_version = new PeersChartNodesByVersion();
        container_1.appendChild(this.nodes_by_version.box_chart.box.element);

        this.nodes_by_height = new PeersChartNodesByHeight();
        container_1.appendChild(this.nodes_by_height.box_chart.box.element);

        this.nodes_by_country = new PeersChartNodesByCountry();
        this.container.element.appendChild(this.nodes_by_country.box_chart.box.element);
    }
}