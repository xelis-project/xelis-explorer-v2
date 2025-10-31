import { ContractLog } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { JsonViewerBox } from "../json_viewer_box/json_viewer_box";
import { localization } from "../../../../localization/localization";

import './contract_logs.css';

export class TransactionContractLogs {
    container: Container;

    constructor(contract_logs: ContractLog[]) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-contract-outputs`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`CONTRACT LOGS`);
        this.container.element.appendChild(title_element);

        const json_viewer_box = new JsonViewerBox(contract_logs);
        this.container.element.appendChild(json_viewer_box.box.element);
    }
}