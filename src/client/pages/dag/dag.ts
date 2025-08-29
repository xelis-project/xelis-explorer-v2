import { DAG } from "../../components/dag/dag";
import { Page } from "../page";

import './dag.css';

export class DAGPage extends Page {
    static pathname = "/dag";
    static title = "DAG";

    dag: DAG;

    constructor() {
        super();


        this.dag = new DAG();
        this.dag.element.classList.add(`xe-dag`);
        this.element.appendChild(this.dag.element);
    }

    load(parent: HTMLElement): void {
        super.load(parent);
        this.dag.update_size();
        this.set_window_title(DAGPage.title);

        this.dag.load(100);
    }
}