import { InvokeContractPayload } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Box } from "../../../../components/box/box";
import { format_xel } from "../../../../utils/format_xel";
import { DepositsBox } from "../deploy_contract/deposits_box";
import { JsonViewer } from "../../../../components/json_viewer/json_viewer";

import './invoke_contract.css';

export class TransactionInvokeContract {
    container: Container;

    title_element: HTMLDivElement;

    constructor(invoke_contract: InvokeContractPayload) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-invoke-contract`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = `INVOKE CONTRACT`;
        this.container.element.appendChild(this.title_element);

        const hash_element = document.createElement(`div`);
        hash_element.innerHTML = invoke_contract.contract;
        this.container.element.appendChild(hash_element);

        const container_element = document.createElement(`div`);

        const entry_id_element = document.createElement(`div`);
        entry_id_element.innerHTML = `<div>ENTRY ID</div><div>${invoke_contract.entry_id}</div>`;
        container_element.appendChild(entry_id_element);

        const max_gas_element = document.createElement(`div`);
        max_gas_element.innerHTML = `<div>MAX GAS</div><div>${format_xel(invoke_contract.max_gas, true)}</div>`;
        container_element.appendChild(max_gas_element);

        this.container.element.appendChild(container_element);

        const deposits_title_element = document.createElement(`div`);
        deposits_title_element.innerHTML = `DEPOSITS`;
        this.container.element.appendChild(deposits_title_element);

        const deposits_box = new DepositsBox(invoke_contract.deposits);
        this.container.element.appendChild(deposits_box.box.element);

        const parameters_title_element = document.createElement(`div`);
        parameters_title_element.innerHTML = `PARAMETERS`;
        this.container.element.appendChild(parameters_title_element);
        const parameters_box = new Box();
        const parameters_json_viewer = new JsonViewer();
        parameters_json_viewer.set_data(invoke_contract.parameters);
        parameters_box.element.appendChild(parameters_json_viewer.element);
        this.container.element.appendChild(parameters_box.element);
    }
}