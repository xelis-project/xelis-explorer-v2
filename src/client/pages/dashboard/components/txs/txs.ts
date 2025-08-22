import { Container } from '../../../../components/container/container';
import { TxItem, TxItemData } from '../../../../components/tx_item/tx_item';

import './txs.css';

export class DashboardTxs {
    container: Container;
    tx_items: TxItem[];

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-txs`, `scrollbar-1`, `scrollbar-1-right`);
        this.tx_items = [];
    }

    load(data: TxItemData[]) {
        this.container.element.replaceChildren();
        data.forEach(item => this.add_tx(item));
    }

    set_loading() {
        for (let i = 0; i < 20; i++) {
            this.add_empty_tx();
        }
    }

    add_empty_tx() {
        const tx_item = new TxItem();
        tx_item.box.set_loading(true);
        this.container.element.appendChild(tx_item.box.element);
    }

    add_tx(item: TxItemData) {
        const tx_item = new TxItem();
        tx_item.set(item);
        this.tx_items.push(tx_item);
        this.container.element.appendChild(tx_item.box.element);
    }
}