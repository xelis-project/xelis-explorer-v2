import { Master } from "../../components/master/master";
import { Page } from "../page";

export class PeersPage extends Page {
    static pathname = "/peers";
    static title = "Peers";

    master: Master;

    constructor() {
        super();
        this.master = new Master();
        this.master.content.classList.add(`xe-peers`);
        this.element.appendChild(this.master.element);

    }

    load(parent: HTMLElement): void {
        super.load(parent);
        this.set_window_title(PeersPage.title);
    }
}