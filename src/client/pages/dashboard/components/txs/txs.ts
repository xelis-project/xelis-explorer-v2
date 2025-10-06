import { Container } from '../../../../components/container/container';
import { TxBlock, TxItem } from '../../../../components/tx_item/tx_item';

import './txs.css';

export class DashboardTxs {
    container: Container;
    tx_items: TxItem[];

    element_title: HTMLDivElement;
    element_content: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-txs`, `scrollbar-1`, `scrollbar-1-right`);
        this.tx_items = [];

        this.element_title = document.createElement(`div`);
        this.element_title.innerHTML = `TRANSACTIONS`;
        this.container.element.appendChild(this.element_title);

        this.element_content = document.createElement(`div`);
        this.container.element.appendChild(this.element_content);
    }

    set(txs_blocks: TxBlock[]) {
        this.element_content.replaceChildren();
        txs_blocks.forEach(tx_block => this.prepend_tx(tx_block));
    }

    prepend_tx(tx_block: TxBlock) {
        const tx_item = new TxItem(`/tx/${tx_block.tx.hash}`);
        tx_item.set(tx_block);

        this.tx_items.unshift(tx_item);
        this.element_content.insertBefore(tx_item.box.element, this.element_content.firstChild);
        return tx_item;
    }

    remove_block_txs(block_hash: string) {
        for (let i = this.tx_items.length - 1; i >= 0; i--) {
            const tx_item = this.tx_items[i];
            if (tx_item.data && tx_item.data.block.hash === block_hash) {
                this.tx_items.splice(i, 1);
                tx_item.box.element.remove();
            }
        }
    }
}