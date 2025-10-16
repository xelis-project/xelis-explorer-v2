import { Container } from '../../../../components/container/container';
import { DashboardBlocksTxs } from './blocks_txs';

import './chart_section_1.css';

export class DashboardChartSection1 {
    container: Container;
    blocks_txs: DashboardBlocksTxs;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-chart-section-1`);

        this.blocks_txs = new DashboardBlocksTxs();
        this.container.element.appendChild(this.blocks_txs.box_chart.box.element)
    }
}