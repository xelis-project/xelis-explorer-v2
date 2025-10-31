import prettyMilliseconds from "pretty-ms";
import { Box } from "../../../../components/box/box";
import { format_xel } from "../../../../utils/format_xel";
import prettyBytes from "pretty-bytes";
import { localization } from "../../../../localization/localization";

import './info.css';

export class MempoolInfo {
    box: Box;

    height_element: HTMLDivElement;
    tx_total_element: HTMLDivElement;
    timer_element: HTMLDivElement;
    total_fees_element: HTMLDivElement;
    total_size_element: HTMLDivElement;

    constructor() {
        this.box = new Box();
        this.box.element.classList.add(`xe-mempool-info`);

        const container_1 = document.createElement(`div`);
        this.box.element.appendChild(container_1);

        this.tx_total_element = document.createElement(`div`);
        this.tx_total_element.classList.add(`xe-mempool-info-tx-total`);
        container_1.appendChild(this.tx_total_element);

        this.timer_element = document.createElement(`div`);
        this.timer_element.classList.add(`xe-mempool-info-timer`);
        container_1.appendChild(this.timer_element);

        const container_2 = document.createElement(`div`);
        this.box.element.appendChild(container_2);

        this.height_element = document.createElement(`div`);
        this.height_element.classList.add(`xe-mempool-info-item`);
        container_2.appendChild(this.height_element);

        this.total_fees_element = document.createElement(`div`);
        this.total_fees_element.classList.add(`xe-mempool-info-item`);
        container_2.appendChild(this.total_fees_element);

        this.total_size_element = document.createElement(`div`);
        this.total_size_element.classList.add(`xe-mempool-info-item`);
        container_2.appendChild(this.total_size_element);
    }

    set_tx_count(tx_count: number) {
        this.tx_total_element.innerHTML = `${tx_count.toLocaleString()} TXS`;
    }

    timer_interval_id?: number;
    set_timer(timestamp: number) {
        const set_time = () => {
            this.timer_element.innerHTML = prettyMilliseconds(Date.now() - timestamp, { colonNotation: true });
        }

        set_time();
        if (this.timer_interval_id) window.clearInterval(this.timer_interval_id);
        this.timer_interval_id = window.setInterval(set_time, 100);
    }

    set_fees(fees: number) {
        this.total_fees_element.innerHTML = `
            <div>${localization.get_text(`FEES`)}</div>
            <div>${format_xel(fees, true)}
        `;
    }

    set_size(size_in_bytes: number) {
        this.total_size_element.innerHTML = `
            <div>${localization.get_text(`SIZE`)}</div>
            <div>${prettyBytes(size_in_bytes)}
        `;
    }

    set_height(height: number) {
        this.height_element.innerHTML = `
            <div>${localization.get_text(`HEIGHT`)}</div>
            <div>${height.toLocaleString()}
        `;
    }
}