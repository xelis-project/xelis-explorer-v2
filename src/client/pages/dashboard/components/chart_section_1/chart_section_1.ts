import { Container } from '../../../../components/container/container';
import { DashboardMarketCap } from './market_cap';

import './chart_section_1.css';
import { DashboardDailyTxs } from './daily_tsx';

export class DashboardChartSection1 {
    container: Container;
    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-chart-section-1`);

        const market_cap = new DashboardMarketCap();
        this.container.element.appendChild(market_cap.box_chart.box.element);

        const daily_transactions = new DashboardDailyTxs();
        this.container.element.appendChild(daily_transactions.box_chart.box.element);
    }
}