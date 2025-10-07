import { DeployContractPayload } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";

import './deploy_contract.css';
import { Box } from "../../../../components/box/box";
import { DepositsBox } from "./deposits_box";
import { format_xel } from "../../../../utils/format_xel";
import { JsonViewer } from "../../../../components/json_viewer/json_viewer";

export class TransactionDeployContract {
    container: Container;

    title_element: HTMLDivElement;

    constructor(hash: string, deploy_contract: DeployContractPayload) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-deploy-contract`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = `DEPLOY CONTRACT`;
        this.container.element.appendChild(this.title_element);

        const hash_element = document.createElement(`div`);
        hash_element.innerHTML = hash;
        this.container.element.appendChild(hash_element);

        const constants_title_element = document.createElement(`div`);
        constants_title_element.innerHTML = `CONSTANTS`;
        this.container.element.appendChild(constants_title_element);
        const constants_box = new Box();
        const constants_json_viewer = new JsonViewer();
        constants_json_viewer.set_data(deploy_contract.module.constants);

        constants_box.element.appendChild(constants_json_viewer.element); //.innerHTML = JSON.stringify(deploy_contract.module.constants, null, 2);
        this.container.element.appendChild(constants_box.element);

        const chunks_title_element = document.createElement(`div`);
        chunks_title_element.innerHTML = `CHUNKS`;
        this.container.element.appendChild(chunks_title_element);
        const chunks_box = new Box();
        const chunks_json_viewer = new JsonViewer();
        chunks_json_viewer.set_data(deploy_contract.module.chunks);
        chunks_box.element.appendChild(chunks_json_viewer.element);
        this.container.element.appendChild(chunks_box.element);

        const hook_ids_title_element = document.createElement(`div`);
        hook_ids_title_element.innerHTML = `HOOK CHUNK IDS`
        this.container.element.appendChild(hook_ids_title_element);
        const hook_ids_box = new Box();
        hook_ids_box.element.innerHTML = JSON.stringify(deploy_contract.module.entry_chunk_ids || [], null, 2);
        this.container.element.appendChild(hook_ids_box.element);

        if (deploy_contract.invoke) {
            const deposits_box = new DepositsBox(deploy_contract.invoke.deposits);
            this.container.element.appendChild(deposits_box.box.element);

            const max_gas_element = document.createElement(`div`);
            max_gas_element.innerHTML = `<div>MAX GAS</div><div>${format_xel(deploy_contract.invoke.max_gas, true)}</div>`;
            this.container.element.appendChild(max_gas_element);
        }
    }
}