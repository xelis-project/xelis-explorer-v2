import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import { XelisNode } from "../../app/xelis_node";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { Master } from "../../components/master/master";
import { Block, RPCEvent as DaemonRPCEvent, RPCMethod as DaemonRPCMethod, GetBlockByHashParams, GetContractModuleParams, GetContractModuleResult, TransactionExecuted, TransactionResponse } from "@xelis/sdk/daemon/types";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { NotFoundPage } from "../not_found/not_found";

import './contract.css';

interface ContractPageServerData {
    transaction?: TransactionResponse;
    contract_module?: GetContractModuleResult;
}

export class ContractPage extends Page {
    static pathname = "/contract/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async load_server_data(daemon: DaemonRPC, contract_hash: string) {
        const server_data = { contract: undefined } as ContractPageServerData;

        {
            const requests = [
                {
                    method: DaemonRPCMethod.GetTransaction,
                    params: { hash: contract_hash }
                },
                {
                    method: DaemonRPCMethod.GetContractModule,
                    params: { contract: contract_hash } as GetContractModuleParams
                },
            ] as RPCRequest[];


            const res = await daemon.batchRequest(requests);
            res.forEach((result, i) => {
                if (result instanceof Error) {
                    throw result;
                } else {
                    switch (i) {
                        case 0: // GetTransaction
                            server_data.transaction = (result as TransactionResponse);
                            break;
                        case 1: // GetContractModule
                            server_data.contract_module = (result as GetContractModuleResult);
                            break;
                    }
                }
            });
        }

        return server_data;
    }

    static async handle_server(c: Context<ServerApp>) {
        let id = ContractPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        const contract_hash = id;
        this.title = `Contract ${contract_hash}`;

        try {
            this.server_data = await this.load_server_data(daemon, contract_hash);
        } catch {
            this.status = 404;
        }
    }

    master: Master;
    page_data: {
        server_data?: ContractPageServerData;
    };

    constructor() {
        super();
        this.page_data = {};

        this.master = new Master();
        this.master.content.classList.add(`xe-contract`);
        this.element.appendChild(this.master.element);
    }

    async load_contract() {
        const { server_data, consumed } = ContractPage.consume_server_data<ContractPageServerData>();
        const id = ContractPage.get_pattern_id(window.location.href);

        this.page_data = {
            server_data
        };

        try {
            if (!consumed && id) {
                const contract_hash = id;
                this.set_window_title(`Contract ${contract_hash}`);

                const node = XelisNode.instance();
                this.page_data.server_data = await ContractPage.load_server_data(node.rpc, contract_hash);
            }
        } catch {

        }
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        await this.load_contract();

        const { server_data } = this.page_data;
        if (server_data && server_data.contract_module && server_data.transaction) {
            this.set_element(this.master.element);

        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }
}