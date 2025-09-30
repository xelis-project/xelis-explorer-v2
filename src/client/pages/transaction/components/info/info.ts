import { TransactionResponse } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { format_xel } from '../../../../utils/format_xel';
import prettyBytes from 'pretty-bytes';
// @ts-ignore
import hashicon from 'hashicon';
import { format_address } from '../../../../utils/format_address';
import icons from '../../../../assets/svg/icons';
import { Box } from '../../../../components/box/box';

import './info.css';

export class TransactionInfo {
    container: Container;

    signer_element: HTMLAnchorElement;
    fees_element: HTMLDivElement;
    size_element: HTMLDivElement;
    hash_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-info`);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);
        this.signer_element = document.createElement(`a`);
        this.signer_element.classList.add(`xe-transaction-info-signer`);
        container_1.appendChild(this.signer_element);

        const exchange_icon = document.createElement(`div`);
        exchange_icon.innerHTML = icons.exchange();
        container_1.appendChild(exchange_icon);

        const container_2 = document.createElement(`div`);
        this.container.element.appendChild(container_2);
        this.fees_element = document.createElement(`div`);
        this.fees_element.classList.add(`xe-transaction-info-fees`);
        container_2.appendChild(this.fees_element);
        this.size_element = document.createElement(`div`);
        this.size_element.classList.add(`xe-transaction-info-size`);
        container_2.appendChild(this.size_element);

        this.hash_element = document.createElement(`div`);
        this.hash_element.classList.add(`xe-transaction-info-hash`);
        this.container.element.appendChild(this.hash_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.signer_element, loading);
        Box.content_loading(this.fees_element, loading);
        Box.content_loading(this.size_element, loading);
        Box.content_loading(this.hash_element, loading);
    }

    set(tx: TransactionResponse) {
        this.set_hash(tx.hash);
        this.set_fees(tx.fee);
        this.set_size(tx.size);
        this.set_signer(tx.source);
    }

    set_hash(hash: string) {
        this.hash_element.innerHTML = `
            <div>HASH</div>
            <div>${hash}</div>
        `;
    }

    set_fees(fees: number) {
        this.fees_element.innerHTML = `
            <div>FEES</div>
            <div>${format_xel(fees, true)}</div>
        `;
    }

    set_size(size_in_bytes: number) {
        this.size_element.innerHTML = `
            <div>SIZE</div>
            <div>${prettyBytes(size_in_bytes)}</div>
        `;
    }

    set_signer(signer: string) {
        const signer_icon = hashicon(signer, 40) as HTMLCanvasElement;
        this.signer_element.replaceChildren();
        this.signer_element.href = `/account/${signer}`;
        this.signer_element.appendChild(signer_icon);
        const signer_text = document.createElement(`div`);
        signer_text.innerHTML = format_address(signer);
        this.signer_element.appendChild(signer_text);
    }
}