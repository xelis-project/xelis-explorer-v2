import { PeerLocation } from "../../../../components/peers_map/peers_map";
import { Container } from "../../../../components/container/container";
import { PeerItem } from "../../../../components/peer_item/peer_item";

import './list.css';
import { TxBlock, TxItem } from "../../../../components/tx_item/tx_item";
import { Transaction } from "@xelis/sdk/daemon/types";
import { App } from "../../../../app/app";

export class MempoolTxsList {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-txs-list`, `scrollbar-1`, `scrollbar-1-right`);
    }

    set_loading() {
        for (let i = 0; i < 20; i++) {
            this.add_empty_block();
        }
    }

    add_empty_block() {
        const tx_item = new TxItem();
        tx_item.box.set_loading(true);
        this.container.element.appendChild(tx_item.box.element);
    }

    set(txs_blocks: TxBlock[]) {
        this.container.element.replaceChildren();
        txs_blocks.forEach((tx_block) => {
            const tx_item = new TxItem();
            tx_item.set(tx_block);

            tx_item.box.element.addEventListener(`click`, () => {
                const app = App.instance();
                app.go_to(`/tx/todo`);
            });

            this.container.element.appendChild(tx_item.box.element);
        });
    }
}