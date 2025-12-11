import { Context } from "hono";
import { Page } from "../page";
import { ServerApp } from "../../../server";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";
import { AccountInfo } from "./components/info/info";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { Block, RPCMethod as DaemonRPCMethod, RPCEvent as DaemonRPCEvent, GetBalanceParams, GetBalanceResult, GetNonceParams, ValidateAddressParams, ValidateAddressResult, GetNonceResult, VersionedNonce, GetBlockAtTopoheightParams, AssetWithData, AssetData } from "@xelis/sdk/daemon/types";
import { XELIS_ASSET } from "@xelis/sdk/config";
import { AccountBalance } from "./components/balance/balance";
import { NotFoundPage } from "../not_found/not_found";
import { AccountKnownAddr } from "./components/known_addr/known_addr";
import { Box } from "../../components/box/box";
import { localization } from "../../localization/localization";
import { AccountAssets } from "./components/assets/assets";
import { AccountHistory } from "./components/history/history";

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

        const daemon = new DaemonRPC(c.get(`node_endpoint`));

        const addr = id;
        this.title = localization.get_text(`Account {}`, [addr]);
        this.description = localization.get_text(`The account history of {}.`, [addr]);

        try {
            this.server_data = await this.load_server_data(daemon, addr);
        } catch {
            this.status = 404;
        }
    }

    page_data: {
        addr?: string;
        assets: AssetWithData[];
        server_data?: AccountServerData;
    };

    master: Master;
    account_info: AccountInfo;
    account_balance: AccountBalance;
    account_known_addr: AccountKnownAddr;
    account_history: AccountHistory;
    account_assets: AccountAssets;

    constructor() {
        super();

        this.page_data = { addr: "", assets: [] };
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

        this.account_assets = new AccountAssets();
        this.master.content.appendChild(this.account_assets.container.element);

        this.account_history = new AccountHistory();
        this.master.content.appendChild(this.account_history.container.element);
    }

    async load_account() {
        const { server_data, consumed } = AccountPage.consume_server_data<AccountServerData>();
        const id = AccountPage.get_pattern_id(window.location.href);

        this.page_data = {
            addr: id,
            server_data,
            assets: []
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

    async load_assets() {
        const { addr } = this.page_data;
        if (!addr) return;

        const xelis_node = XelisNode.instance();
        const hashes = await xelis_node.rpc.getAccountAssets({ address: addr });

        const assets = [] as AssetWithData[];
        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            const asset = await xelis_node.ws.methods.getAsset({ asset: hash });
            assets.push({ asset: hash, ...asset });
        }
        this.account_assets.set(assets);
        this.page_data.assets = assets;
    }

    update_interval_1000_id?: number;
    update_interval_1000 = () => {
        this.account_history.history_rows.forEach(history_row => {
            if (history_row.data) {
                history_row.set_age(history_row.data.block_timestamp);
            }
        });

        if (this.page_data.server_data) {
            const { balance, last_activity_timestamp } = this.page_data.server_data;
            this.account_info.set_last_activity(balance.topoheight, last_activity_timestamp);
        }
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
                    // refresh history only when we're on first page
                    if (this.account_history.pager_topos.length === 0) {
                        this.account_history.load_history();
                    }
                }
            }
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.removeListener(DaemonRPCEvent.NewBlock, null, this.on_new_block);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.addListener(DaemonRPCEvent.NewBlock, null, this.on_new_block);
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        // Box.list_loading(this.incoming_history_list.list_element, 10, `3rem`);
        //Box.list_loading(this.outgoing_history_list.list_element, 10, `3rem`);
        Box.list_loading(this.account_assets.items_element, 10, `.75rem`, `10rem`);

        await this.load_account();
        this.listen_node_events();

        const { addr, server_data } = this.page_data;
        if (addr && server_data) {
            this.set_element(this.master.element);

            this.account_info.set(addr, server_data);
            this.account_known_addr.set(addr);

            await this.load_assets();
            this.account_history.set(addr, server_data, this.page_data.assets);
            this.update_interval_1000_id = window.setInterval(this.update_interval_1000, 1000);
        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }

    unload() {
        super.unload();
        this.clear_node_events();
        window.clearInterval(this.update_interval_1000_id);
    }
}