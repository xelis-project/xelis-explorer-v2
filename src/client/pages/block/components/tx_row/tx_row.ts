import { format_address } from "../../../../utils/format_address";
//@ts-ignore
import hashicon from 'hashicon';
import { reduce_text } from "../../../../utils/reduce_text";
import { format_xel } from "../../../../utils/format_xel";
import { Transaction, TransactionData } from "@xelis/sdk/daemon/types";
import prettyBytes from "pretty-bytes";
import { format_asset } from "../../../../utils/format_asset";

export class TxRow {
    element: HTMLTableRowElement;
    cell_1_element: HTMLTableCellElement;
    cell_2_element: HTMLTableCellElement;
    cell_3_element: HTMLTableCellElement;
    cell_4_element: HTMLTableCellElement;
    cell_5_element: HTMLTableCellElement;

    constructor() {
        this.element = document.createElement(`tr`);
        this.element.classList.add(`xe-blocks-tx-row`);

        this.cell_1_element = document.createElement(`td`);
        this.element.appendChild(this.cell_1_element);
        this.cell_2_element = document.createElement(`td`);
        this.element.appendChild(this.cell_2_element);
        this.cell_3_element = document.createElement(`td`);
        this.element.appendChild(this.cell_3_element);
        this.cell_4_element = document.createElement(`td`);
        this.element.appendChild(this.cell_4_element);
        this.cell_5_element = document.createElement(`td`);
        this.element.appendChild(this.cell_5_element);
    }

    
    set_loading(loading: boolean) {
        if (loading) {
            this.element.classList.add(`xe-block-tx-row-loading`);
        } else {
            this.element.classList.remove(`xe-blocks-tx-row-loading`);
        }
    }

    set(tx: Transaction) {
        this.set_hash(tx.hash);
        this.set_fee(tx.fee);
        this.set_signer(tx.source);
        this.set_type(tx.data);
        this.set_size(tx.size);
    }

    set_hash(hash: string) {
        this.cell_1_element.innerHTML = `${reduce_text(hash)}`;
    }

    set_type(data: TransactionData) {
        let value = ``;
        if (data.burn) {
            value = `Burn ${format_asset(data.burn.asset, data.burn.amount, true)}`;
        } else if (data.deploy_contract) {
            value = `Deploy Contract`;
        } else if (data.invoke_contract) {
            value = `Invoke Contract ${reduce_text(data.invoke_contract.contract)}`;
        } else if (data.multi_sig) {
            value = `Multi Sig ${data.multi_sig.participants.length} / ${data.multi_sig.threshold}`;
        } else if (data.transfers) {
            value = `${data.transfers.length} transfer`;
        }

        this.cell_2_element.innerHTML = value;
    }

    set_signer(signer: string) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-miner`);

        const signer_icon = hashicon(signer, 25) as HTMLCanvasElement;
        container.appendChild(signer_icon);

        const signer_addr = document.createElement(`div`);
        signer_addr.innerHTML = format_address(signer);
        container.appendChild(signer_addr);

        this.cell_3_element.replaceChildren();
        this.cell_3_element.appendChild(container);
    }

    set_size(size_in_bytes: number) {
        this.cell_4_element.innerHTML = `${prettyBytes(size_in_bytes)}`;
    }

    set_fee(fee: number) {
        this.cell_5_element.innerHTML = `${format_xel(fee, true)}`;
    }
}