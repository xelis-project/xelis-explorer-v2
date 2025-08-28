import { Master } from "../../components/master/master";
import { Page } from "../page";

export class MempoolPage extends Page {
    static pathname = "/mempool";
    static title = "Mempool";

    master: Master;

    constructor() {
        super();
        this.master = new Master();
        this.master.content.classList.add(`xe-mempool`);
        this.element.appendChild(this.master.element);

    }

    load(parent: HTMLElement): void {
        super.load(parent);
        this.set_window_title(MempoolPage.title);
    }
}