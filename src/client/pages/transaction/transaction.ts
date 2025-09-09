import { Context } from "hono";
import { Page } from "../page";
import { App as ServerApp } from "../../../server";
import { XelisNode } from "../../app/xelis_node";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { Master } from "../../components/master/master";

export class TransactionPage extends Page {
    static pathname = "/tx/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
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
            const transaction = await daemon.getTransaction(tx_hash);
        } catch {
            this.status = 404;
        }
    }

    master: Master;

    constructor() {
        super();

        this.master = new Master();
        this.element.appendChild(this.master.element);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
    }
}