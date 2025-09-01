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

    set_loading(loading: boolean) {
        // TODO
    }

    set_tx_count(tx_count: number) {
        this.blocks_txs.box_chart.element_value.innerHTML = `${tx_count.toLocaleString()} TXS`;
    }

    set(blocks: Block[]) {
        const total_txs = blocks.reduce((t, b) => t + b.txs_hashes.length, 0);
        this.set_tx_count(total_txs);
        this.blocks_txs.build_chart(blocks);
    }
}