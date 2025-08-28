import prettyBytes from "pretty-bytes";
import { Container } from "../../../../components/container/container"
import { Block, BlockType, GetInfoResult } from "@xelis/sdk/daemon/types";
import prettyMilliseconds from "pretty-ms";

import './info.css';

export class BlockInfo {
    container: Container

    height_type_element: HTMLDivElement;
    age_element: HTMLDivElement;

    topo_element: HTMLDivElement;
    size_element: HTMLDivElement;
    tx_count_element: HTMLDivElement;

    confirmations_element: HTMLDivElement;
    version_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-info`);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);
        this.height_type_element = document.createElement(`div`);
        this.height_type_element.classList.add(`xe-block-height-type`);
        container_1.appendChild(this.height_type_element);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);
        this.confirmations_element = document.createElement(`div`);
        sub_container_1.appendChild(this.confirmations_element);
        this.version_element = document.createElement(`div`);
        sub_container_1.appendChild(this.version_element);

        const container_2 = document.createElement(`div`);
        this.container.element.appendChild(container_2);
        this.age_element = document.createElement(`div`);
        container_2.appendChild(this.age_element);

        const sub_container_2 = document.createElement(`div`);
        container_2.appendChild(sub_container_2);
        this.topo_element = document.createElement(`div`);
        sub_container_2.appendChild(this.topo_element);
        this.size_element = document.createElement(`div`);
        sub_container_2.appendChild(this.size_element);
        this.tx_count_element = document.createElement(`div`);
        sub_container_2.appendChild(this.tx_count_element);
    }

    set(block: Block, info: GetInfoResult) {
        this.set_height_type(block.height, block.block_type);
        this.set_age(block.timestamp);
        this.set_size(block.total_size_in_bytes);
        this.set_tx_count(block.txs_hashes.length);
        this.set_confirmations(block.height, info.height);
        this.set_version(block.version);
        this.set_topo(block.topoheight);
    }

    set_height_type(height: number, block_type: BlockType) {
        this.height_type_element.replaceChildren();

        const block_element = document.createElement(`div`);
        block_element.classList.add(`xe-block-item-type-${block_type.toLowerCase()}`);
        this.height_type_element.appendChild(block_element);

        const sub_container = document.createElement(`div`);
        this.height_type_element.appendChild(sub_container);

        const height_element = document.createElement(`div`);
        height_element.innerHTML = `${height.toLocaleString()}`;
        sub_container.appendChild(height_element);

        const text_element = document.createElement(`div`);
        text_element.innerHTML = `${block_type.toUpperCase()} BLOCK`;
        sub_container.appendChild(text_element);
    }

    set_topo(topoheight?: number) {
        this.topo_element.innerHTML = topoheight ? `${topoheight.toLocaleString()} TOPO` : `--`;
    }

    age_interval_id?: number;
    set_age(timestamp: number) {
        const set_age = () => {
            this.age_element.innerHTML = `${prettyMilliseconds(Date.now() - timestamp, { compact: true })}`;
        }

        set_age();
        if (this.age_interval_id) window.clearInterval(this.age_interval_id);
        this.age_interval_id = window.setInterval(set_age, 1000);
    }

    set_confirmations(height: number, current_height: number) {
        const confirmations = current_height - height;
        this.confirmations_element.innerHTML = `${confirmations.toLocaleString()} confirmations`;
    }

    set_version(version: number) {
        this.version_element.innerHTML = `Version ${version}`;
    }

    set_size(size_in_bytes: number) {
        this.size_element.innerHTML = prettyBytes(size_in_bytes);
    }

    set_tx_count(tx_count: number) {
        this.tx_count_element.innerHTML = `${tx_count.toLocaleString()} txs`;
    }
}