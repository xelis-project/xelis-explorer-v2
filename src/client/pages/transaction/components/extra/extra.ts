import { TransactionResponse } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';

import './extra.css';

export class TransactionExtra {
    container: Container;

    ref_topo_element: HTMLDivElement;
    ref_hash_element: HTMLDivElement;
    nonce_element: HTMLDivElement;
    version_element: HTMLDivElement;
    signature_element: HTMLDivElement;
    in_mempool_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-extra`);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-transaction-extra-container-1`);
        this.container.element.appendChild(container_1);

        this.ref_topo_element = document.createElement(`div`);

        container_1.appendChild(this.ref_topo_element);
        this.nonce_element = document.createElement(`div`);
        container_1.appendChild(this.nonce_element);
        this.in_mempool_element = document.createElement(`div`);
        container_1.appendChild(this.in_mempool_element);
        this.version_element = document.createElement(`div`);
        container_1.appendChild(this.version_element);

        const container_2 = document.createElement(`div`);
        container_2.classList.add(`xe-transaction-extra-container-2`);
        this.container.element.appendChild(container_2);

        this.ref_hash_element = document.createElement(`div`);
        container_2.appendChild(this.ref_hash_element);

        this.signature_element = document.createElement(`div`);
        container_2.appendChild(this.signature_element);
    }

    set(tx: TransactionResponse) {
        this.set_in_mempool(tx.in_mempool);
        this.set_version(tx.version);
        this.set_nonce(tx.nonce);
        this.set_signature(tx.signature);
        this.set_ref_hash(tx.reference.hash);
        this.set_ref_topo(tx.reference.topoheight);
    }

    set_ref_topo(ref_topo: number) {
        this.ref_topo_element.innerHTML = `
            <div>REF TOPO</div>
            <a href="/topo/${ref_topo}">${ref_topo.toLocaleString()}</a>
        `;
    }

    set_ref_hash(ref_hash: string) {
        this.ref_hash_element.innerHTML = `
            <div>REF HASH</div>
            <a href="/block/${ref_hash}">${ref_hash}</a>
        `;
    }

    set_signature(signature: string) {
        this.signature_element.innerHTML = `
            <div>SIGNATURE</div>
            <div>${signature}<div>
        `;
    }

    set_nonce(nonce: number) {
        this.nonce_element.innerHTML = `
            <div>NONCE</div>
            <div>${nonce.toLocaleString()}<div>
        `;
    }

    set_in_mempool(in_mempool: boolean) {
        this.in_mempool_element.innerHTML = `
            <div>IN MEMPOOL</div>
            <div>${in_mempool ? `YES` : `NO`}<div>
        `;
    }

    set_version(version: number) {
        this.version_element.innerHTML = `
            <div>VERSION</div>
            <div>${version}<div>
        `;
    }
}