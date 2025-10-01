import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import { XelisNode } from "../../app/xelis_node";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { Master } from "../../components/master/master";
import { TransactionInfo } from "./components/info/info";
import { TransactionExtra } from "./components/extra/extra";
import { TransactionInBlocks } from "./components/in_blocks/in_blocks";
import { Block, RPCMethod as DaemonRPCMethod, GetBlockByHashParams, TransactionResponse } from "@xelis/sdk/daemon/types";
import { NotFoundPage } from "../not_found/not_found";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { TransactionTransfers } from "./components/transfers/transfers";
import { TransactionBurn } from "./components/burn/burn";
import { TransactionDeployContract } from "./components/deploy_contract/deploy_contract";
import { TransactionInvokeContract } from "./components/invoke_contract/invoke_contract";

import './transaction.css';

interface TransactionPageServerData {
    transaction: TransactionResponse;
    in_blocks: Block[];
}

export class TransactionPage extends Page {
    static pathname = "/tx/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async load_server_data(daemon: DaemonRPC, tx_hash: string) {
        const server_data = {} as TransactionPageServerData;

        server_data.transaction = await daemon.getTransaction(tx_hash);

        {
            const tx_blocks = server_data.transaction.blocks;
            if (tx_blocks && tx_blocks.length > 0) {
                const requests = [] as RPCRequest[];
                tx_blocks.forEach((block_hash) => {
                    requests.push({
                        method: DaemonRPCMethod.GetBlockByHash,
                        params: { hash: block_hash } as GetBlockByHashParams
                    });
                });

                server_data.in_blocks = [];
                const res = await daemon.batchRequest(requests);
                res.forEach((result) => {
                    if (result instanceof Error) {
                        throw result;
                    } else {
                        server_data.in_blocks.push(result as Block);
                    }
                });
            }
        }

        return server_data;
    }

    static async handle_server(c: Context<ServerApp>) {
        let id = TransactionPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        const tx_hash = id;
        this.title = `Transaction ${tx_hash}`;

        try {
            this.server_data = await this.load_server_data(daemon, tx_hash);
        } catch {
            this.status = 404;
        }
    }

    master: Master;
    page_data: {
        server_data?: TransactionPageServerData;
    };
    transaction_info: TransactionInfo;
    transaction_extra: TransactionExtra;
    transaction_in_blocks: TransactionInBlocks;
    transaction_type_container: HTMLDivElement;

    constructor() {
        super();

        this.page_data = {};
        this.master = new Master();
        this.master.content.classList.add(`xe-transaction`);
        this.element.appendChild(this.master.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-transaction-container-1`);
        this.master.content.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        sub_container_1.classList.add(`xe-transaction-sub-container-1`);
        container_1.appendChild(sub_container_1);
        this.transaction_info = new TransactionInfo();
        sub_container_1.appendChild(this.transaction_info.container.element);
        this.transaction_extra = new TransactionExtra();
        sub_container_1.appendChild(this.transaction_extra.container.element);
        this.transaction_in_blocks = new TransactionInBlocks();
        sub_container_1.appendChild(this.transaction_in_blocks.container.element);

        this.transaction_type_container = document.createElement(`div`);
        this.transaction_type_container.classList.add(`xe-transaction-sub-container-2`);
        container_1.appendChild(this.transaction_type_container);
    }

    async load_transaction() {
        const { server_data, consumed } = TransactionPage.consume_server_data<TransactionPageServerData>();
        const id = TransactionPage.get_pattern_id(window.location.href);

        this.page_data = {
            server_data
        };

        try {
            if (!consumed && id) {
                const tx_hash = id;
                this.set_window_title(`Transaction ${tx_hash}`);

                const node = XelisNode.instance();

                this.page_data.server_data = await TransactionPage.load_server_data(node.rpc, tx_hash);
            }
        } catch {

        }
    }

    set_loading(loading: boolean) {
        this.transaction_info.set_loading(loading);
        this.transaction_extra.set_loading(loading);
        this.transaction_in_blocks.set_loading(loading);
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        this.set_loading(true);
        await this.load_transaction();
        this.set_loading(false);

        const { server_data } = this.page_data;
        if (server_data) {
            this.set_element(this.master.element);

            const { transaction, in_blocks } = server_data;

            this.transaction_info.set(transaction);
            this.transaction_extra.set(transaction);
            this.transaction_in_blocks.set(in_blocks, transaction.executed_in_block);

            this.transaction_type_container.replaceChildren();
            if (transaction.data.transfers) {
                const transaction_transfers = new TransactionTransfers();
                transaction_transfers.set(transaction.data.transfers);
                this.transaction_type_container.appendChild(transaction_transfers.container.element);
            }

            if (transaction.data.burn) {
                const transaction_burn = new TransactionBurn(transaction.data.burn);
                this.transaction_type_container.appendChild(transaction_burn.container.element);
            }

            if (transaction.data.deploy_contract) {
                const transaction_deploy_contract = new TransactionDeployContract(transaction.hash, transaction.data.deploy_contract);
                this.transaction_type_container.appendChild(transaction_deploy_contract.container.element);
            }

            if (transaction.data.invoke_contract) {
                const transaction_invoke_contract = new TransactionInvokeContract(transaction.data.invoke_contract);
                this.transaction_type_container.appendChild(transaction_invoke_contract.container.element);
            }
        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }
}