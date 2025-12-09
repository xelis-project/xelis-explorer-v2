import { Container } from "../../../../components/container/container";
import { localization } from "../../../../localization/localization";

import './mempool_alert.css';

export class TransactionMempoolAlert {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-mempool-alert`);
        this.container.element.innerHTML = localization.get_text(`This transaction is still in the mempool. Waiting for execution...`);
    }
}