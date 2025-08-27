import { App } from "../../../../app/app";
import { XelisNode } from "../../../../app/xelis_node";
import { Container } from "../../../../components/container/container";
import { TextInput } from "../../../../components/text_input/text_input";

import './search.css';

export class DashboardSearch {
    container: Container;
    text_input: TextInput;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-search`);

        const form = document.createElement(`form`);
        this.container.element.appendChild(form);

        this.text_input = new TextInput();
        this.text_input.element.name = `dashboard_search_input`;
        this.text_input.element.placeholder = `Search block, transaction or account address`;
        form.appendChild(this.text_input.element);

        form.addEventListener(`submit`, (e) => {
            e.preventDefault();
            this.search();
        });
    }

    async search() {
        const node = XelisNode.instance();
        const app = App.instance();

        const search_value = this.text_input.element.value;
        if (search_value) {
            if (/^\d+$/.test(search_value)) {
                app.go_to(`/block/${search_value}`);
                return;
            }

            if (search_value.length === 64) {
                const tx = await node.rpc.getTransaction(search_value);
                if (tx) {
                    app.go_to(`/tx/${search_value}`);
                    return;
                }
            }

            if (search_value.startsWith(`xel:`)) { // TODO: xet
                const addr = await node.rpc.validateAddress({
                    address: search_value,
                    allow_integrated: false
                });

                if (addr.is_valid) {
                    app.go_to(`/addr/${search_value}`);
                    return;
                }
            }
        }
    }
}