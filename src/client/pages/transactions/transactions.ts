import { Page } from "../page";
import { Master } from "../../components/master/master";
import { XelisNode } from "../../app/xelis_node";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { TxRow } from "./tx_row/tx_row";
import { RPCEvent as DaemonRPCEvent, GetInfoResult, TransactionExecuted, TransactionResponse } from "@xelis/sdk/daemon/types";
import { fetch_blocks } from "../../fetch_helpers/fetch_blocks";

import './transactions.css';
import { fetch_blocks_txs } from "../../fetch_helpers/fetch_blocks_txs";

export class TransactionsPage extends Page {
    static pathname = "/transactions";
    static title = "Transactions";

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
        this.container_table.element.classList.add(`xe-transactions-table`);
        this.master.content.appendChild(this.container_table.element);

        this.table = new Table();
        this.table.set_clickable();
        this.container_table.element.appendChild(this.table.element);

        const titles = ["HEIGHT", "HASH", "TYPE", "SIGNER", "SIZE", "FEE", "EXECUTED IN", "AGE"];
        this.table.set_head_row(titles);
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
        node.ws.methods.closeListener(DaemonRPCEvent.TransactionExecuted, this.on_transaction_executed);
    }

    async listen_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.listen(DaemonRPCEvent.TransactionExecuted, this.on_transaction_executed);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(TransactionsPage.title);
        this.listen_node_events();
        const node = XelisNode.instance();

        this.table.set_loading(100);

        const info = await node.rpc.getInfo();
        this.page_data.info = info;

        const blocks = await fetch_blocks(info.height, 100);
        await fetch_blocks_txs(blocks);

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
    }

    unload() {
        super.unload();
        this.clear_node_events();
    }
}