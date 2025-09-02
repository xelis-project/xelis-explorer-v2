import './tx_type_bars.css';

export class MempoolTxTypeBars {
    element: HTMLDivElement;
    transfers_element: HTMLDivElement;
    invokes_element: HTMLDivElement;
    multisigs_element: HTMLDivElement;
    deploys_element: HTMLDivElement;
    burns_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-mempool-tx-type-bars`);

        this.transfers_element = document.createElement(`div`);
        this.element.appendChild(this.transfers_element);

        this.invokes_element = document.createElement(`div`);
        this.element.appendChild(this.invokes_element);

        this.multisigs_element = document.createElement(`div`);
        this.element.appendChild(this.multisigs_element);

        this.deploys_element = document.createElement(`div`);
        this.element.appendChild(this.deploys_element);

        this.burns_element = document.createElement(`div`);
        this.element.appendChild(this.burns_element);
    }

    build_bar(count: number, max: number) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-mempool-tx-type-bars-bar`);
        const over_bar = document.createElement(`div`);
        container.appendChild(over_bar);
        over_bar.style.width = `${count * 100 / max}%`;
        return container;
    }

    set_item(element: HTMLDivElement, title: string, count: number, max: number) {
        element.replaceChildren();
        const text = document.createElement(`div`);
        text.innerHTML = `${count} ${title}`;
        element.appendChild(text);
        const bar = this.build_bar(count, max);
        element.appendChild(bar);
        return element;
    }

    set_transfer_count(count: number, max: number) {
        this.set_item(this.transfers_element, "TRANSFERS", count, max);
    }

    set_contract_invoke_count(count: number, max: number) {
        this.set_item(this.invokes_element, "CONTRACT INVOKES", count, max);
    }

    set_multisig_count(count: number, max: number) {
        this.set_item(this.multisigs_element, "MULTISIGS", count, max);
    }

    set_contract_deploy_count(count: number, max: number) {
        this.set_item(this.deploys_element, "CONTRACT DEPLOYS", count, max);
    }

    set_burn_count(count: number, max: number) {
        this.set_item(this.burns_element, "BURNS", count, max);
    }
}