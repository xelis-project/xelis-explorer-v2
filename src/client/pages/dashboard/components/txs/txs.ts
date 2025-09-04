import { App } from '../../../../app/app';
import { Container } from '../../../../components/container/container';
import { TxBlock, TxItem } from '../../../../components/tx_item/tx_item';
import { DashboardPage } from '../../dashboards';

import './txs.css';

export class DashboardTxs {
    container: Container;
    tx_items: TxItem[];

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-txs`, `scrollbar-1`, `scrollbar-1-right`);
        this.tx_items = [];
    }

    set(txs_blocks: TxBlock[]) {
        this.container.element.replaceChildren();
        txs_blocks.forEach(tx_block => this.prepend_tx(tx_block));
    }

    prepend_tx(tx_block: TxBlock) {
        const tx_item = new TxItem();
        tx_item.set(tx_block);
        tx_item.box.element.addEventListener(`click`, () => {
            App.instance().go_to(`/tx/${tx_block.tx.hash}`);
        });

        this.tx_items.unshift(tx_item);
        this.container.element.insertBefore(tx_item.box.element, this.container.element.firstChild);
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