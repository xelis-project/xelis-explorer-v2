import { ContentfulStatusCode } from "hono/utils/http-status";
import { Page } from "../page";
import { Master } from "../../components/master/master";

export class NotFoundPage extends Page {
    static title = "Page Not Found";
    static status: ContentfulStatusCode = 404;

    master: Master;

    constructor() {
        super();

        this.master = new Master();
        this.element.appendChild(this.master.element);

        const text = document.createElement(`div`);
        text.innerHTML = "NOT FOUND!!";
        this.element.appendChild(text);
    }

    load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(NotFoundPage.title);
    }
}