import { ContractOutput } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { JsonViewer } from "../../../../components/json_viewer/json_viewer";
import { Box } from "../../../../components/box/box";

import './contract_outputs.css';

export class TransactionContractOutputs {
    container: Container;

    constructor(outputs: ContractOutput[]) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-contract-outputs`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = `CONTRACT OUTPUTS`;
        this.container.element.appendChild(title_element);

        const box = new Box();
        const json_viewer = new JsonViewer();

        const data = {} as any;
        outputs.forEach((output) => {
            Object.keys(output).forEach(key => {
                data[key] = (output as any)[key];
            });
        });

        json_viewer.set_data(data);
        box.element.appendChild(json_viewer.element);
        this.container.element.appendChild(box.element);
    }
}