import { Block, RPCMethod, Transaction } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Table } from "../../../../components/table/table";
import { XelisNode } from "../../../../app/xelis_node";
import { TxRow } from "../tx_row/tx_row";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { localization } from "../../../../localization/localization";
import { TxDataHover } from "../../../../components/tx_data_hover/tx_data_hover";

import './txs.css';

export class BlockTxs {
    container: Container;
    table: Table;
    tx_data_hover: TxDataHover;

    tx_data_hover_timeout?: number;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-txs`);

        this.tx_data_hover = new TxDataHover();
        //this.container.element.appendChild(this.tx_data_hover.element);

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

                tx_row.element.addEventListener(`mouseenter`, (e) => {
                    if (this.tx_data_hover.visible) return;
                    window.clearInterval(this.tx_data_hover_timeout);
                    this.tx_data_hover_timeout = window.setTimeout(() => {
                        this.tx_data_hover.set_pos(e.pageX + 300, e.pageY - (this.tx_data_hover.element.clientHeight / 2));
                        this.tx_data_hover.show(tx.data);
                    }, 500);
                });

                tx_row.element.addEventListener(`mouseleave`, (e) => {
                    window.clearInterval(this.tx_data_hover_timeout);
                    if (!this.tx_data_hover.element.contains(e.relatedTarget as Node)) {
                        this.tx_data_hover.hide();
                    }
                });

                this.table.prepend_row(tx_row.element);
            });
        } else {
            this.table.set_empty(localization.get_text(`No transactions`));
        }
    }
}