import { Block, Transaction, TransactionData } from '@xelis/sdk/daemon/types';
import { Box } from '../box/box';
import './tx_item.css';
import { reduce_text } from '../../utils/reduce_text';
import prettyMilliseconds from 'pretty-ms';
import prettyBytes from 'pretty-bytes';
//@ts-ignore
import hashicon from "hashicon";
import { format_address } from '../../utils/format_address';
import { format_xel } from '../../utils/format_xel';
import { format_asset } from '../../utils/format_asset';

export interface TxBlock {
    block: Block;
    tx: Transaction;
}

export class TxItem {
    box: Box;
    data?: TxBlock;
    element_hash: HTMLDivElement;
    element_type: HTMLDivElement;
    element_age: HTMLDivElement;
    element_size: HTMLDivElement;
    element_signer: HTMLDivElement;
    element_height: HTMLDivElement;
    element_fee: HTMLDivElement;

    constructor() {
        this.box = new Box();
        this.box.element.classList.add(`xe-tx-item`);

        const container_1 = document.createElement(`div`);
        this.box.element.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.element_hash = document.createElement(`div`);
        this.element_hash.classList.add(`xe-tx-item-hash`);
        sub_container_1.appendChild(this.element_hash);

        this.element_type = document.createElement(`div`);
        this.element_type.classList.add(`xe-tx-item-type`);
        sub_container_1.appendChild(this.element_type);

        const sub_container_2 = document.createElement(`div`);
        container_1.appendChild(sub_container_2);

        this.element_signer = document.createElement(`div`);
        this.element_signer.classList.add(`xe-tx-item-signer`);
        sub_container_2.appendChild(this.element_signer);

        const container_2 = document.createElement(`div`);
        this.box.element.appendChild(container_2);

        const sub_container_3 = document.createElement(`div`);
        container_2.appendChild(sub_container_3);

        this.element_age = document.createElement(`div`);
        this.element_age.classList.add(`xe-tx-item-age`);
        sub_container_3.appendChild(this.element_age);

        this.element_size = document.createElement(`div`);
        this.element_size.classList.add(`xe-tx-item-size`);
        sub_container_3.appendChild(this.element_size);

        const sub_container_4 = document.createElement(`div`);
        container_2.appendChild(sub_container_4);

        this.element_height = document.createElement(`div`);
        this.element_height.classList.add(`xe-block-item-height`);
        sub_container_4.appendChild(this.element_height);

        this.element_fee = document.createElement(`div`);
        this.element_fee.classList.add(`xe-tx-item-fee`);
        sub_container_4.appendChild(this.element_fee);
    }

    set_hash(hash: string) {
        this.element_hash.innerHTML = `${reduce_text(hash)}`;
    }

    set_age(timestamp: number) {
        const set_age = () => {
            this.element_age.innerHTML = `${prettyMilliseconds(Date.now() - timestamp, { compact: true })}`;
        }

        set_age();
        window.setInterval(set_age, 1000);
    }

    set_size(size_in_bytes: number) {
        this.element_size.innerHTML = `${prettyBytes(size_in_bytes)}`;
    }

    set_signer(signer: string) {
        const signer_icon = hashicon(signer, 25) as HTMLCanvasElement;
        this.element_signer.replaceChildren();
        this.element_signer.appendChild(signer_icon);
        const miner_text = document.createElement(`div`);
        miner_text.innerHTML = format_address(signer);
        this.element_signer.appendChild(miner_text);
    }

    set_height(height: number) {
        this.element_height.innerHTML = `${height.toLocaleString()}`;
    }

    set_fee(fee: number) {
        this.element_fee.innerHTML = `${format_xel(fee, true)}`;
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

        this.element_type.innerHTML = value;
    }

    set(data: TxBlock) {
        this.data = data;
        const { tx } = data;
        this.set_hash(tx.hash);
        this.set_age(data.block.timestamp);
        this.set_size(tx.size);
        this.set_signer(tx.source);
        this.set_height(data.block.height);
        this.set_fee(tx.fee);
        this.set_type(tx.data);
    }
}