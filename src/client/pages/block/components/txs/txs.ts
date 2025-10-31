import { Block, RPCMethod, Transaction } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Table } from "../../../../components/table/table";
import { XelisNode } from "../../../../app/xelis_node";
import { TxRow } from "../tx_row/tx_row";
import { RPCRequest } from "@xelis/sdk/rpc/types";

import './txs.css';
import { localization } from "../../../../localization/localization";

export class BlockTxs {
    container: Container;
    table: Table;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-txs`);

        this.table = new Table();
        this.table.set_clickable();
        this.container.element.appendChild(this.table.element);

        const titles = [
            localization.get_text(`HASH`),
            localization.get_text(`TYPE`),
            localization.get_text(`SIGNER`),
            localization.get_text(`SIZE`),
            localization.get_text(`FEE`)
        ];
        this.table.set_head_row(titles);
    }

    async load(block: Block) {
        const node = XelisNode.instance();
        // A block with a lot of txs: e3818b9824351af0cbae4db51bd73381bb5838949a76d65d910a9bf0d48cdc2e
        const requests = [] as RPCRequest[];
        for (let i = 0; i < block.txs_hashes.length; i += 20) {
            const tx_hashes = block.txs_hashes.slice(i, i + 20);
            requests.push({
                method: RPCMethod.GetTransactions,
                params: { tx_hashes }
            });
        }

        let txs = [] as Transaction[];
        const res = await node.rpc.batchRequest(requests);
        res.forEach((result) => {
            if (result instanceof Error) {
                console.log(result)
            } else {
                txs = [...txs, ...result as any];
            }
        });

        this.table.body_element.replaceChildren();
        if (txs.length > 0) {
            txs.forEach((tx) => {
                const tx_row = new TxRow();
                tx_row.set(tx);
                this.table.prepend_row(tx_row.element);
            });
        } else {
            this.table.set_empty(localization.get_text(`No transactions`));
        }
    }
}