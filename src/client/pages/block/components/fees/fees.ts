import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { Box } from "../../../../components/box/box";
import { localization } from "../../../../localization/localization";
import { format_xel } from "../../../../utils/format_xel";

import './fees.css';

export class BlockFees {
    container: Container;

    total_fees_element: HTMLDivElement;
    total_fees_burned_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-fees`);

        this.total_fees_element = document.createElement(`div`);
        this.container.element.appendChild(this.total_fees_element);

        this.total_fees_burned_element = document.createElement(`div`);
        this.container.element.appendChild(this.total_fees_burned_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.total_fees_element, loading);
        Box.content_loading(this.total_fees_burned_element, loading);
    }

    set(block: Block) {
        this.set_total_fees_paid(block.total_fees, block.total_fees_burned);
        this.set_total_fees_burned(block.total_fees_burned);
    }

    set_total_fees_paid(total_fees?: number, total_fees_burned?: number) {
        this.total_fees_element.innerHTML = `
            <div>${localization.get_text(`TOTAL FEES PAID`)}</div>
            <div>${total_fees && total_fees_burned ? format_xel(total_fees + total_fees_burned, true) : `--`}</div>
        `;
    }

    set_total_fees_burned(total_fees_burned?: number) {
        this.total_fees_burned_element.innerHTML = `
            <div>${localization.get_text(`TOTAL FEES BURNED`)}</div>
            <div>${total_fees_burned ? format_xel(total_fees_burned, true, undefined, { maximumFractionDigits: 4 }) : `--`}</div>
        `;
    }
}