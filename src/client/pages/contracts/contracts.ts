import { Page } from "../page";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { ContractRow } from "./contract_row/contract_row";
import { GetContractBalanceParams, GetInfoResult, RPCMethod } from "@xelis/sdk/daemon/types";
import { get_contracts } from "../../data/contracts";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { XELIS_ASSET } from "@xelis/sdk/config";

import './contracts.css';
import { fetch_contracts } from "../../fetch_helpers/fetch_contracts";

export class ContractsPage extends Page {
    static pathname = "/contracts";
    static title = "Contracts";

    master: Master;

    container_table: Container;
    table: Table;

    contract_rows: ContractRow[];
    page_data: {
        info?: GetInfoResult;
    }

    constructor() {
        super();

        this.contract_rows = [];
        this.page_data = {};

        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-contracts`);

        this.container_table = new Container();
        this.container_table.element.classList.add(`xe-contracts-table`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.table.set_clickable();
        this.container_table.element.appendChild(this.table.element);

        const titles = ["HASH", "NAME", "BALANCE", "TOPOHEIGHT (BALANCE)", "REGISTERED"];
        this.table.set_head_row(titles);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(ContractsPage.title);

        const contracts = get_contracts();

        this.table.set_loading(100);
        this.table.body_element.replaceChildren();

        const contracts_list = Object.keys(contracts);
        for (let i = 0; i < contracts_list.length; i += 6) {
            const contract_batch = contracts_list.slice(i, i + 6);
            const contracts_info = await fetch_contracts(contract_batch);

            contracts_info.forEach((contract_info, a) => {
                const hash = contract_batch[a];
                const contract = contracts[hash];

                const contract_row = new ContractRow();
                contract_row.set(contract.name, contract_info);

                this.table.prepend_row(contract_row.element);
            });
        }

        if (this.table.body_element.children.length === 0) {
            this.table.set_empty("No contracts");
        }
    }

    unload() {
        super.unload();
    }
}