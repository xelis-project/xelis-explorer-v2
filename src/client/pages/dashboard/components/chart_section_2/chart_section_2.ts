import { Container } from '../../../../components/container/container';
import { DashboardHashRate } from './hashrate';
import { DashboardPools } from './pools';
import { DashboardBlockTime } from './block_time';

import './chart_section_2.css';

export class DashboardChartSection2 {
    container: Container;
    hashrate: DashboardHashRate;
    pools: DashboardPools;
    block_time: DashboardBlockTime;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-chart-section-2`);

        this.hashrate = new DashboardHashRate();
        this.container.element.appendChild(this.hashrate.box_chart.box.element);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);

        this.pools = new DashboardPools();
        container_1.appendChild(this.pools.box_chart.box.element);

        this.block_time = new DashboardBlockTime();
        container_1.appendChild(this.block_time.box_chart.box.element);
    }
}