import { Container } from "../../../../components/container/container";
import { MempoolChartTxsTransfers } from "./txs_transfers";

import './chart.css';

export class MempoolChart {
    container: Container;

    txs_transfers: MempoolChartTxsTransfers;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-chart`);

        this.txs_transfers = new MempoolChartTxsTransfers();
        this.container.element.appendChild(this.txs_transfers.box_chart.box.element);
    }

    set_loading(loading: boolean) {
        // TODO
    }
}