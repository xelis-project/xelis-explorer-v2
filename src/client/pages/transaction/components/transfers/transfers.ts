import { Transfer } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { TransactionTransferItem } from "./transfer_item";

import './transfers.css';

export class TransactionTransfers {
    container: Container;

    title_element: HTMLDivElement;
    transfers_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-transfers`, `scrollbar-1`, `scrollbar-1-right`);

        this.title_element = document.createElement(`div`);
        this.title_element.innerHTML = `TRANSFERS`;
        this.container.element.appendChild(this.title_element);

        this.transfers_element = document.createElement(`div`);
        this.container.element.appendChild(this.transfers_element);
    }

    append_transfer(transfer: Transfer) {
        const transfer_item = new TransactionTransferItem();
        transfer_item.set(transfer);
        this.transfers_element.appendChild(transfer_item.box.element);
    }

    set(transfers: Transfer[]) {
            this.title_element.innerHTML = `TRANSFERS (${transfers.length})`;
        this.transfers_element.replaceChildren();
        transfers.forEach((transfer) => {
            this.append_transfer(transfer);
        });
    }
}