import { Master } from "../../components/master/master";
import { Page } from "../page";

export class DAGPage extends Page {
    static pathname = "/dag";
    static title = "DAG";

    master: Master;

    constructor() {
        super();
        this.master = new Master();
        this.master.content.classList.add(`xe-dag`);
        this.element.appendChild(this.master.element);

    }

    load(parent: HTMLElement): void {
        super.load(parent);
        this.set_window_title(DAGPage.title);
    }
}