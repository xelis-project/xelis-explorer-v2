import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { format_xel } from "../../../../utils/format_xel";
import { Box } from "../../../../components/box/box";
import { localization } from "../../../../localization/localization";

import './extra.css';

export class BlockExtra {
    container: Container;

    supply_element: HTMLDivElement;

    local_time_element: HTMLDivElement;
    unix_time_element: HTMLDivElement;
    utc_time_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-extra`);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-block-extra-container-1`);
        this.container.element.appendChild(container_1);
        this.supply_element = document.createElement(`div`);
        this.supply_element.title = localization.get_text(`Total Supply at this height.`);
        container_1.appendChild(this.supply_element);

        const container_2 = document.createElement(`div`);
        container_2.classList.add(`xe-block-extra-container-2`);
        this.container.element.appendChild(container_2);
        this.local_time_element = document.createElement(`div`);
        container_2.appendChild(this.local_time_element);
        this.unix_time_element = document.createElement(`div`);
        container_2.appendChild(this.unix_time_element);
        this.utc_time_element = document.createElement(`div`);
        container_2.appendChild(this.utc_time_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.supply_element, loading);
        Box.content_loading(this.local_time_element, loading);
        Box.content_loading(this.unix_time_element, loading);
        Box.content_loading(this.utc_time_element, loading);
    }

    set(block: Block) {
        this.set_supply(block.supply);
        this.set_local_time(block.timestamp);
        this.set_unix_time(block.timestamp);
        this.set_utc_time(block.timestamp);
    }

    set_supply(supply?: number) {
        this.supply_element.innerHTML = `
            <div>${localization.get_text(`TOTAL SUPPLY`)}</div>
            <div>${supply ? format_xel(supply, true) : `--`}
        `;
    }

    set_local_time(timestamp: number) {
        this.local_time_element.innerHTML = `
            <div>${localization.get_text(`LOCAL`)}</div>
            <div>${new Date(timestamp).toLocaleString()}</div>
        `;
    }

    set_unix_time(timestamp: number) {
        this.unix_time_element.innerHTML = `
            <div>UNIX</div>
            <div>${timestamp}</div>
        `;
    }

    set_utc_time(timestamp: number) {
        this.utc_time_element.innerHTML = `
            <div>UTC</div>
            <div>${new Date(timestamp).toUTCString()}</div>
        `;
    }
}