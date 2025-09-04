import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { MempoolChartBlocksTxs } from "./blocks_txs";

import './chart.css';

export class MempoolChart {
    container: Container;

    blocks_txs: MempoolChartBlocksTxs;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-chart`);

        this.blocks_txs = new MempoolChartBlocksTxs();
        this.container.element.appendChild(this.blocks_txs.box_chart.box.element);
    }
}