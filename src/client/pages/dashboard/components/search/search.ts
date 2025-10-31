import { App } from "../../../../app/app";
import { localization } from "../../../../localization/localization";
import { XelisNode } from "../../../../app/xelis_node";
import icons from "../../../../assets/svg/icons";
import { Container } from "../../../../components/container/container";
import { TextInput } from "../../../../components/text_input/text_input";

import './search.css';

export class DashboardSearch {
    container: Container;
    text_input: TextInput;


    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-search`);

        const form_element = document.createElement(`form`);
        this.container.element.appendChild(form_element);
        this.text_input = new TextInput();
        this.text_input.element.name = `dashboard_search_input`;
        this.text_input.element.placeholder = localization.get_text(`Search block, transaction or account address`);
        form_element.appendChild(this.text_input.element);

        const search_button = document.createElement(`button`);
        search_button.ariaLabel = this.text_input.element.placeholder;
        search_button.innerHTML = `${icons.search()}`;
        search_button.type = `submit`;
        form_element.appendChild(search_button);

        form_element.addEventListener(`submit`, (e) => {
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
                app.go_to(`/topo/${search_value}`);
                return;
            }

            if (search_value.length === 64) {
                try {
                    const tx = await node.rpc.getTransaction(search_value);
                    if (tx) {
                        app.go_to(`/tx/${search_value}`);
                        return;
                    }
                } catch {

                }

                try {
                    const block = await node.rpc.getBlockByHash({
                        hash: search_value
                    });
                    if (block) {
                        app.go_to(`/block/${search_value}`);
                        return;
                    }
                } catch {

                }
            }

            if (search_value.startsWith(`xel:`)) { // TODO: xet
                try {
                    const addr = await node.rpc.validateAddress({
                        address: search_value,
                        allow_integrated: false
                    });

                    if (addr.is_valid) {
                        app.go_to(`/account/${search_value}`);
                        return;
                    }
                } catch {

                }
            }
        }
    }
}