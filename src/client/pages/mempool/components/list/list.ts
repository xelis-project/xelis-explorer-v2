import icons from "../../../../assets/svg/icons";
import { Container } from "../../../../components/container/container";
import { TxBlock, TxItem } from "../../../../components/tx_item/tx_item";

import './list.css';

export class MempoolTxsList {
    container: Container;
    empty_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-txs-list`, `scrollbar-1`, `scrollbar-1-right`);

        this.empty_element = document.createElement(`div`);
        this.empty_element.classList.add(`xe-mempool-txs-list-empty`);
        this.empty_element.innerHTML = `${icons.empty_box()}<div>No transactions in mempool.</div>`;
    }

    set_empty(empty: boolean) {
        if (empty) this.container.element.appendChild(this.empty_element);
        else this.empty_element.remove();
    }

    prepend_tx(tx_block: TxBlock) {
        const tx_item = new TxItem(`/tx/${tx_block.tx.hash}`);
        tx_item.set(tx_block);

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