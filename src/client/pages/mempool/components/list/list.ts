import { PeerLocation } from "../../../../components/peers_map/peers_map";
import { Container } from "../../../../components/container/container";
import { PeerItem } from "../../../../components/peer_item/peer_item";
import { TxBlock, TxItem } from "../../../../components/tx_item/tx_item";
import { Transaction } from "@xelis/sdk/daemon/types";
import { App } from "../../../../app/app";

import './list.css';

export class MempoolTxsList {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-txs-list`, `scrollbar-1`, `scrollbar-1-right`);
    }

    prepend_tx(tx_block: TxBlock) {
        const tx_item = new TxItem();
        tx_item.set(tx_block);
        tx_item.box.element.addEventListener(`click`, () => {
            App.instance().go_to(`/tx/${tx_block.tx.hash}`);
        });

        // this.tx_items.unshift(tx_item);
        this.container.element.insertBefore(tx_item.box.element, this.container.element.firstChild);
    }

    set(txs_block: TxBlock[]) {
        this.container.element.replaceChildren();
        txs_block.forEach((tx_block) => {
            this.prepend_tx(tx_block);
        });
    }
}