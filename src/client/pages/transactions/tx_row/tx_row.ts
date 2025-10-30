import { Block, Transaction, TransactionData, TransactionResponse } from "@xelis/sdk/daemon/types";
import { format_address } from "../../../utils/format_address";
//@ts-ignore
import hashicon from "hashicon";
import prettyBytes from "pretty-bytes";
import { format_xel } from "../../../utils/format_xel";
import prettyMilliseconds from "pretty-ms";
import { Row } from "../../../components/table/row";
import { format_asset } from "../../../utils/format_asset";
import { format_hash } from "../../../utils/format_hash";

import './tx_row.css';

export class TxRow extends Row {
    transaction?: Transaction;

    constructor() {
        super(8);
    }

    set(block: Block, transaction: TransactionResponse) {
        this.transaction = transaction;
        this.set_height(block.height);
        this.set_hash(transaction.hash);
        this.set_type(transaction.data);
        this.set_signer(transaction.source);
        this.set_size(transaction.size);
        this.set_fee(transaction.fee);
        this.set_executed_in_block(transaction.executed_in_block);
        this.set_age(block.timestamp);
        this.set_link(`/tx/${transaction.hash}`);
    }

    set_height(height: number) {
        this.value_cells[0].innerHTML = `${height.toLocaleString()}`;
    }

    set_hash(hash: string) {
        this.value_cells[1].innerHTML = format_hash(hash);
    }

    set_type(data: TransactionData) {
        let value = ``;
        if (data.burn) {
            value = `Burn ${format_asset(data.burn.asset, data.burn.amount, true)}`;
        } else if (data.deploy_contract) {
            value = `Deploy Contract`;
        } else if (data.invoke_contract) {
            value = `Invoke Contract (${format_hash(data.invoke_contract.contract)})`;
        } else if (data.multi_sig) {
            value = `Multi Sig ${data.multi_sig.participants.length} / ${data.multi_sig.threshold}`;
        } else if (data.transfers) {
            value = `${data.transfers.length} transfer`;
        }

        this.value_cells[2].innerHTML = value;
    }

    set_signer(signer: string) {
        const container = document.createElement(`div`);
        container.classList.add(`xe-blocks-table-miner`);

        const signer_icon = hashicon(signer, 25) as HTMLCanvasElement;
        container.appendChild(signer_icon);

        const signer_addr = document.createElement(`div`);
        signer_addr.innerHTML = format_address(signer);
        container.appendChild(signer_addr);

        this.value_cells[3].replaceChildren();
        this.value_cells[3].appendChild(container);
    }

    set_size(size_in_bytes: number) {
        this.value_cells[4].innerHTML = prettyBytes(size_in_bytes);
    }

    set_fee(fee: number) {
        this.value_cells[5].innerHTML = format_xel(fee, true);
    }

    set_executed_in_block(executed_in_block?: string) {
        this.value_cells[6].innerHTML = executed_in_block ? format_hash(executed_in_block) : `--`;
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.value_cells[7].innerHTML = prettyMilliseconds(Date.now() - timestamp, { colonNotation: true, secondsDecimalDigits: 0 });
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }
}