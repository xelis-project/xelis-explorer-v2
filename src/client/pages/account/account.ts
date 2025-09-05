import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { XelisNode } from "../../app/xelis_node";
import { Master } from "../../components/master/master";

import "./account.css";

interface AccountServerData {
    registration_topoheight: number;
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
            const registration_topoheight = await daemon.getAccountRegistrationTopoheight(addr);
            this.server_data = { registration_topoheight } as AccountServerData;
        } catch {
            this.status = 404;
        }
    }

    page_data: {
        registration_topoheight?: number;
    };
    master: Master;
    constructor() {
        super();

        this.page_data = {};
        this.master = new Master();
        this.element.appendChild(this.master.element);
    }

    async load_account() {
        const { server_data, consumed } = AccountPage.consume_server_data<AccountServerData>();
        const id = AccountPage.get_pattern_id(window.location.href);

        this.page_data = {
            registration_topoheight: server_data ? server_data.registration_topoheight : undefined
        };

        try {
            if (!consumed && id) {
                const addr = id;
                this.set_window_title(`Account ${addr.toLocaleString()}`);

                const node = XelisNode.instance();

                if (!this.page_data.registration_topoheight) {
                    this.page_data.registration_topoheight = await node.rpc.getAccountRegistrationTopoheight(addr);
                }
            }
        } catch {

        }
    }

    load(parent: HTMLElement): void {
        super.load(parent);

        this.load_account();
    }
}