import { Container } from "../../../../components/container/container";
import { DAG } from "../../../../components/dag/dag";

import './dag.css';

export class DashboardDAG {
    container: Container;
    dag: DAG;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-dag`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = `DAG Graph Inspector`;
        this.container.element.appendChild(title_element);

        this.dag = new DAG();
        this.dag.element.classList.add(`xe-dashboard-dag-dag`);
        this.container.element.appendChild(this.dag.element);
        setTimeout(() => this.dag.update_size());
    }
}