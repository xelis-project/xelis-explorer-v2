import { DeployContractPayload } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Box } from "../../../../components/box/box";
import { DepositsBox } from "./deposits_box";
import { format_xel } from "../../../../utils/format_xel";
import { JsonViewerBox } from "../json_viewer_box/json_viewer_box";
import { localization } from "../../../../localization/localization";

import './deploy_contract.css';

export class TransactionDeployContract {
    container: Container;

    title_element: HTMLDivElement;

    constructor(hash: string, deploy_contract: DeployContractPayload) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-deploy-contract`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = localization.get_text(`DEPLOY CONTRACT`);
        this.container.element.appendChild(this.title_element);

        const hash_element = document.createElement(`div`);
        hash_element.innerHTML = hash;
        this.container.element.appendChild(hash_element);

        const constants_title_element = document.createElement(`div`);
        constants_title_element.innerHTML = localization.get_text(`CONSTANTS`);
        this.container.element.appendChild(constants_title_element);

        const constant_json_viewer_box = new JsonViewerBox(deploy_contract.module.constants);
        this.container.element.appendChild(constant_json_viewer_box.box.element);

        const chunks_title_element = document.createElement(`div`);
        chunks_title_element.innerHTML = localization.get_text(`CHUNKS`);
        this.container.element.appendChild(chunks_title_element);

        const chunks_json_viewer_box = new JsonViewerBox(deploy_contract.module.chunks);
        this.container.element.appendChild(chunks_json_viewer_box.box.element);

        const hook_ids_title_element = document.createElement(`div`);
        hook_ids_title_element.innerHTML = localization.get_text(`HOOK CHUNK IDS`);
        this.container.element.appendChild(hook_ids_title_element);
        const hook_ids_box = new Box();
        hook_ids_box.element.innerHTML = JSON.stringify(deploy_contract.module.hook_chunk_ids || [], null, 2);
        this.container.element.appendChild(hook_ids_box.element);

        if (deploy_contract.invoke) {
            const deposits_title_element = document.createElement(`div`);
            deposits_title_element.innerHTML = localization.get_text(`DEPOSITS`);
            this.container.element.appendChild(deposits_title_element);

            const deposits_box = new DepositsBox(deploy_contract.invoke.deposits);
            this.container.element.appendChild(deposits_box.box.element);

            const max_gas_title = document.createElement(`div`);
            max_gas_title.innerHTML = localization.get_text(`MAX GAS`);
            this.container.element.appendChild(max_gas_title);

            const max_gas_value = document.createElement(`div`);
            max_gas_value.innerHTML = format_xel(deploy_contract.invoke.max_gas, true);
            this.container.element.appendChild(max_gas_value);
        }
    }
}