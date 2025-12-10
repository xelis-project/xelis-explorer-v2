import { Page } from "../page";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { TxRow } from "./tx_row/tx_row";
import { RPCEvent as DaemonRPCEvent, GetInfoResult, TransactionExecuted, TransactionResponse } from "@xelis/sdk/daemon/types";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";
import { fetch_blocks_txs } from "../../fetch_helpers/fetch_blocks_txs";
import { localization } from "../../localization/localization";
import { Context } from "hono";
import { ServerApp } from "../../../server";

import './transactions.css';

export class TransactionsPage extends Page {
    static pathname = "/transactions";

    static async handle_server(c: Context<ServerApp>) {
        this.title = localization.get_text(`Transactions`);
        this.description = localization.get_text(`List of recent executed transactions.`);
    }

    master: Master;

    container_table: Container;
    table: Table;

    tx_rows: TxRow[];
    page_data: {
        info?: GetInfoResult;
    }

    constructor() {
        super();

        this.tx_rows = [];
        this.page_data = {};

        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-transactions`);

        this.container_table = new Container();
        this.container_table.element.classList.add(`xe-transactions-table`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.table.set_clickable();
        this.container_table.element.appendChild(this.table.element);

        const titles = [
            localization.get_text(`HEIGHT`),
            localization.get_text(`HASH`),
            localization.get_text(`TYPE`),
            localization.get_text(`SIGNER`),
            localization.get_text(`SIZE`),
            localization.get_text(`FEE`),
            localization.get_text(`EXECUTED IN`),
            localization.get_text(`AGE`)
        ];
        this.table.set_head_row(titles);
    }

    update_interval_1000_id?: number;
    update_interval_1000 = () => {
        this.tx_rows.forEach(tx_row => {
            if (tx_row.block) {
                tx_row.set_age(tx_row.block.timestamp);
            }
        });
    }

    on_transaction_executed = async (transaction_executed?: TransactionExecuted, err?: Error) => {
        console.log("transaction_executed", transaction_executed);

        if (transaction_executed) {
            const node = XelisNode.instance();
            const transaction = await node.ws.methods.getTransaction(transaction_executed.tx_hash);
            const block = await node.ws.methods.getBlockByHash({ hash: transaction_executed.block_hash });

            const new_tx_row = new TxRow();
            new_tx_row.set(block, transaction);
            this.table.prepend_row(new_tx_row.element);
            new_tx_row.animate_prepend();

            if (this.tx_rows.length > 5) {
                this.tx_rows.pop();
                this.table.remove_last();
            }
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.removeListener(DaemonRPCEvent.TransactionExecuted, null, this.on_transaction_executed);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.addListener(DaemonRPCEvent.TransactionExecuted, null, this.on_transaction_executed);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(localization.get_text(`Transactions`));
        this.listen_node_events();
        const node = XelisNode.instance();

        this.table.set_loading(100);

        const info = await node.rpc.getInfo();
        this.page_data.info = info;

        const blocks = await fetch_blocks(info.height, 100);
        await fetch_blocks_txs(blocks);

        this.tx_rows = [];
        this.table.body_element.replaceChildren();
        blocks.forEach((block) => {
            if (block.transactions) {
                block.transactions.forEach((tx) => {
                    const tx_row = new TxRow();
                    tx_row.set(block, tx as TransactionResponse);
                    this.table.prepend_row(tx_row.element);
                    this.tx_rows.push(tx_row);
                });
            }
        });

        if (this.table.body_element.children.length === 0) {
            this.table.set_empty(localization.get_text(`No recent transactions`));
        }

        this.update_interval_1000_id = window.setInterval(this.update_interval_1000, 1000);
    }

    unload() {
        super.unload();
        this.clear_node_events();
        window.clearInterval(this.update_interval_1000_id);
    }
}