import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
import { AccountInfo } from "./components/info/info";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { Block, RPCMethod as DaemonRPCMethod, RPCEvent as DaemonRPCEvent, GetBalanceParams, GetBalanceResult, GetNonceParams, ValidateAddressParams, ValidateAddressResult, GetNonceResult, VersionedNonce, GetBlockAtTopoheightParams } from "@xelis/sdk/daemon/types";
import { XELIS_ASSET } from "@xelis/sdk/config";
import { AccountHistoryList } from "./components/history_list/history_list";
import { AccountBalance } from "./components/balance/balance";
import { NotFoundPage } from "../not_found/not_found";
import { AccountKnownAddr } from "./components/known_addr/known_addr";
import { Box } from "../../components/box/box";

import "./account.css";

export interface AccountServerData {
    is_integrated: boolean;
    registration_topoheight: number;
    registration_timestamp: number;
    nonce: VersionedNonce;
    last_activity_timestamp: number;
    balance: GetBalanceResult;
}

export class AccountPage extends Page {
    static pathname = "/account/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async load_server_data(daemon: DaemonRPC, addr: string) {
        const server_data = {} as AccountServerData;

        {
            const requests = [
                {
                    method: DaemonRPCMethod.ValidateAddress,
                    params: { address: addr, allow_integrated: true } as ValidateAddressParams
                },
                {
                    method: DaemonRPCMethod.GetAccountRegistrationTopoheight,
                    params: { address: addr }
                },
                {
                    method: DaemonRPCMethod.GetNonce,
                    params: { address: addr } as GetNonceParams
                },
                {
                    method: DaemonRPCMethod.GetBalance,
                    params: { address: addr, asset: XELIS_ASSET } as GetBalanceParams
                }
            ] as RPCRequest[];


            const res = await daemon.batchRequest(requests);
            res.forEach((result, i) => {
                if (result instanceof Error) {
                    throw result;
                } else {
                    switch (i) {
                        case 0: // ValidateAddress
                            server_data.is_integrated = (result as ValidateAddressResult).is_integrated;
                            break;
                        case 1: // GetAccountRegistrationTopoheight
                            server_data.registration_topoheight = (result as number);
                            break;
                        case 2: // GetNonce
                            server_data.nonce = result as VersionedNonce;
                            break;
                        case 3: // GetBalance (encrypted)
                            server_data.balance = result as GetBalanceResult;
                            break;
                    }
                }
            });
        }

        {
            const requests = [
                {
                    method: DaemonRPCMethod.GetBlockAtTopoheight,
                    params: { topoheight: server_data.balance.topoheight } as GetBlockAtTopoheightParams
                },
                {
                    method: DaemonRPCMethod.GetBlockAtTopoheight,
                    params: { topoheight: server_data.registration_topoheight } as GetBlockAtTopoheightParams
                },
            ] as RPCRequest[];

            const res = await daemon.batchRequest(requests);
            res.forEach((result, i) => {
                if (result instanceof Error) {
                    throw result;
                }

                switch (i) {
                    case 0: // getBlockAtTopoheight
                        const last_balance_block = result as Block;
                        server_data.last_activity_timestamp = last_balance_block.timestamp;
                        break;
                    case 1: // getBlockAtTopoheight
                        const registration_block = result as Block;
                        server_data.registration_timestamp = registration_block.timestamp;
                        break;
                }
            });
        }

        return server_data;
    }

    static async handle_server(c: Context<ServerApp>) {
        let id = AccountPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(XelisNode.rpc_node_endpoint);

        const addr = id;
        this.title = `Account ${addr}`;

        try {
            this.server_data = await this.load_server_data(daemon, addr);
        } catch {
            this.status = 404;
        }
    }

    page_data: {
        addr?: string;
        server_data?: AccountServerData;
    };

    master: Master;
    account_info: AccountInfo;
    account_balance: AccountBalance;
    account_known_addr: AccountKnownAddr;
    incoming_history_list: AccountHistoryList;
    outgoing_history_list: AccountHistoryList;

    constructor() {
        super();

        this.page_data = { addr: "" };
        this.master = new Master();
        this.element.appendChild(this.master.element);

        this.account_known_addr = new AccountKnownAddr();
        this.master.content.appendChild(this.account_known_addr.container.element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-account-container-1`);
        this.master.content.appendChild(container_1);

        this.account_info = new AccountInfo();
        container_1.appendChild(this.account_info.container.element);

        this.account_balance = new AccountBalance();
        container_1.appendChild(this.account_balance.container.element);

        const container_2 = document.createElement(`div`);
        container_2.classList.add(`xe-account-container-2`);
        this.master.content.appendChild(container_2);

        this.incoming_history_list = new AccountHistoryList(`Incoming`);
        container_2.appendChild(this.incoming_history_list.container.element);

        this.outgoing_history_list = new AccountHistoryList(`Outgoing`);
        container_2.appendChild(this.outgoing_history_list.container.element);
    }

    async load_account() {
        const { server_data, consumed } = AccountPage.consume_server_data<AccountServerData>();
        const id = AccountPage.get_pattern_id(window.location.href);

        this.page_data = {
            addr: id,
            server_data
        };

        try {
            if (!consumed && id) {
                const addr = id;
                this.set_window_title(`Account ${addr.toLocaleString()}`);

                const node = XelisNode.instance();
                this.page_data.server_data = await AccountPage.load_server_data(node.rpc, addr);
            }
        } catch {

        }
    }

    async load_history() {
        const { addr } = this.page_data;
        if (!addr) return;

        const xelis_node = XelisNode.instance();

        const incoming = await xelis_node.rpc.getAccountHistory({
            address: addr,
            incoming_flow: true,
            outgoing_flow: false
        });

        const outgoing = await xelis_node.rpc.getAccountHistory({
            address: addr,
            incoming_flow: false,
            outgoing_flow: true
        });

        incoming.sort((a, b) => a.block_timestamp - b.block_timestamp);
        this.incoming_history_list.set(incoming);

        outgoing.sort((a, b) => a.block_timestamp - b.block_timestamp);
        this.outgoing_history_list.set(outgoing);
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block)

        if (new_block) {
            const node = XelisNode.instance();

            const { addr, server_data } = this.page_data;

            if (addr && server_data) {
                const balance = await node.rpc.getBalance({
                    address: addr,
                    asset: XELIS_ASSET
                });

                if (balance.topoheight > server_data.balance.topoheight) {
                    this.load_history();
                }
            }
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        await this.load_account();
        this.listen_node_events();

        const { addr, server_data } = this.page_data;
        if (addr && server_data) {
            this.set_element(this.master.element);

            this.account_info.set(addr, server_data);
            this.account_known_addr.set(addr);

            Box.list_loading(this.incoming_history_list.list_element, 10, `3rem`);
            Box.list_loading(this.outgoing_history_list.list_element, 10, `3rem`);
            await this.load_history();
        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}