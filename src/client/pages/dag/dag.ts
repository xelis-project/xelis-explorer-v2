import { App } from "../../app/app";
import icons from "../../assets/svg/icons";
import { DAG } from "../../components/dag/dag";
import { Page } from "../page";
import queryString from "query-string";

import './dag.css';

export class DAGPage extends Page {
    static pathname = "/dag";
    static title = "DAG";

    dag: DAG;

    home_button_element: HTMLButtonElement;

    constructor() {
        super();

        this.home_button_element = document.createElement(`button`);
        this.home_button_element.classList.add(`xe-dag-back`);
        this.home_button_element.innerHTML = icons.home();
        this.home_button_element.addEventListener(`click`, () => {
            App.instance().go_to(`/`);
        });
        this.element.appendChild(this.home_button_element);

        this.dag = new DAG();
        this.dag.element.classList.add(`xe-dag`);
        this.element.appendChild(this.dag.element);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.dag.update_size();
        this.set_window_title(DAGPage.title);

        const parsed_query = queryString.parse(location.search);
        let height = undefined as number | undefined;
        if (parsed_query && typeof parsed_query.height === `string`) {
            height = parseInt(parsed_query.height);
        }

        if (height) {
            this.dag.overlay_loading.set_loading(true);
            await this.dag.load_blocks(height);
            this.dag.overlay_loading.set_loading(false);
        } else {
            this.dag.set_live(true);
        }
    }

    unload() {
        super.unload();
        this.dag.clear_node_events();
    }
}