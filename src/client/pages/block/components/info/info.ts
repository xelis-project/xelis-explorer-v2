import prettyBytes from "pretty-bytes";
import { Container } from "../../../../components/container/container"
import { Block, BlockType, GetInfoResult } from "@xelis/sdk/daemon/types";
import prettyMilliseconds from "pretty-ms";
import { BlockTypeBox } from "../../../../components/block_type_box/block_type_box";
import { Box } from "../../../../components/box/box";

import './info.css';
import { localization } from "../../../../localization/localization";

export class BlockInfo {
    container: Container

    last_update_element: HTMLDivElement;

    height_type_element: HTMLDivElement;
    age_element: HTMLDivElement;

    topo_element: HTMLDivElement;
    size_element: HTMLDivElement;
    tx_count_element: HTMLDivElement;

    confirmations_element: HTMLDivElement;
    version_element: HTMLDivElement;

    sub_container_1: HTMLDivElement;
    sub_container_2: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-info`);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);
        this.height_type_element = document.createElement(`div`);
        this.height_type_element.classList.add(`xe-block-info-type`);
        container_1.appendChild(this.height_type_element);

        this.sub_container_1 = document.createElement(`div`);
        container_1.appendChild(this.sub_container_1);
        this.confirmations_element = document.createElement(`div`);
        this.sub_container_1.appendChild(this.confirmations_element);
        this.version_element = document.createElement(`div`);
        this.sub_container_1.appendChild(this.version_element);

        const container_2 = document.createElement(`div`);
        this.container.element.appendChild(container_2);
        this.age_element = document.createElement(`div`);
        this.age_element.classList.add(`xe-block-info-age`);
        container_2.appendChild(this.age_element);

        this.sub_container_2 = document.createElement(`div`);
        container_2.appendChild(this.sub_container_2);
        this.topo_element = document.createElement(`div`);
        this.sub_container_2.appendChild(this.topo_element);
        this.size_element = document.createElement(`div`);
        this.sub_container_2.appendChild(this.size_element);
        this.tx_count_element = document.createElement(`div`);
        this.sub_container_2.appendChild(this.tx_count_element);

        this.last_update_element = document.createElement(`div`);
        this.last_update_element.classList.add(`xe-block-info-last-update`);
        this.container.element.appendChild(this.last_update_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.height_type_element, loading);
        Box.content_loading(this.sub_container_1, loading);
        Box.content_loading(this.age_element, loading);
        Box.content_loading(this.sub_container_2, loading);
    }

    set(block: Block, info: GetInfoResult) {
        this.set_height_type(block.block_type, block.topoheight);
        this.set_age(block.timestamp);
        this.set_size(block.total_size_in_bytes);
        this.set_tx_count(block.txs_hashes.length);
        this.set_confirmations(block.height, info.height);
        this.set_version(block.version);
        this.set_height(block.height);
        this.set_last_update();
    }

    set_height_type(block_type: BlockType, topoheight?: number) {
        this.height_type_element.replaceChildren();

        const block_type_box = new BlockTypeBox();
        block_type_box.set(2.5, block_type);
        this.height_type_element.appendChild(block_type_box.element);

        const sub_container = document.createElement(`div`);
        this.height_type_element.appendChild(sub_container);

        const topo_element = document.createElement(`div`);
        topo_element.innerHTML = `${topoheight ? topoheight.toLocaleString() : `?`}`;
        sub_container.appendChild(topo_element);

        const text_element = document.createElement(`div`);
        text_element.innerHTML = localization.get_text(`{} BLOCK`, [block_type.toUpperCase()]);
        sub_container.appendChild(text_element);
    }

    set_height(height: number) {
        this.topo_element.innerHTML = `${height.toLocaleString()} HEIGHT`;
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
        this.confirmations_element.innerHTML = localization.get_text(`{} confirmations`, [confirmations.toLocaleString()]);;
    }

    set_version(version: number) {
        this.version_element.innerHTML = localization.get_text(`Version {}`, [version.toLocaleString()]);
    }

    set_size(size_in_bytes: number) {
        this.size_element.innerHTML = prettyBytes(size_in_bytes);
    }

    set_tx_count(tx_count: number) {
        this.tx_count_element.innerHTML = `${tx_count.toLocaleString()} txs`;
    }

    last_update_interval_id: any;
    last_update_timestamp: any;
    set_last_update() {
        this.last_update_timestamp = Date.now();

        const set_timer = () => {
            this.last_update_element.innerHTML = `${prettyMilliseconds(Date.now() - this.last_update_timestamp, { compact: true })}`;
        }

        set_timer();
        if (this.last_update_interval_id) window.clearInterval(this.last_update_interval_id);
        this.last_update_interval_id = window.setInterval(set_timer, 1000);
    }
}