import prettyMilliseconds from "pretty-ms";
import { Box } from "../../../../components/box/box";
import { reduce_text } from "../../../../utils/reduce_text";
import { AccountHistory } from "@xelis/sdk/daemon/types";
import { format_xel } from "../../../../utils/format_xel";
import { format_address } from "../../../../utils/format_address";
// @ts-ignore
import hashicon from 'hashicon';

import './history_item.css';

export class AccountHistoryListItem {
    box: Box;

    hash_element: HTMLDivElement;
    height_element: HTMLDivElement;
    age_element: HTMLDivElement;
    type_element: HTMLDivElement;

    constructor(href?: string) {
        this.box = new Box(href);
        this.box.element.classList.add(`xe-account-list-item`);

        const container_1 = document.createElement(`div`);
        this.box.element.appendChild(container_1);

        this.hash_element = document.createElement(`div`);
        container_1.appendChild(this.hash_element);

        this.age_element = document.createElement(`div`);
        container_1.appendChild(this.age_element);

        const container_2 = document.createElement(`div`);
        this.box.element.appendChild(container_2);

        this.height_element = document.createElement(`div`);
        container_2.appendChild(this.height_element);

        this.type_element = document.createElement(`div`);
        container_2.appendChild(this.type_element);
    }

    set(history: AccountHistory) {
        this.set_hash(history.hash);
        this.set_topoheight(history.topoheight);
        this.set_age(history.block_timestamp);
        this.set_type(history);
    }

    set_hash(hash: string) {
        this.hash_element.innerHTML = reduce_text(hash);
    }

    set_topoheight(topoheight: number) {
        this.height_element.innerHTML = `${topoheight.toLocaleString()}`;
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

    set_type(history: AccountHistory) {
        if (history.incoming) {
            const addr = history.incoming.from;
            const to_icon = hashicon(addr, 25) as HTMLCanvasElement;
            this.type_element.classList.add(`xe-account-list-item-outgoing`);
            this.type_element.replaceChildren();
            const text = document.createElement(`div`);
            text.innerHTML = `IN TRANSFER`;
            this.type_element.appendChild(text);
            this.type_element.appendChild(to_icon);
            const addr_text = document.createElement(`div`);
            addr_text.innerHTML = format_address(addr);
            this.type_element.appendChild(addr_text);
        }

        if (history.outgoing) {
            const addr = history.outgoing.to;
            const to_icon = hashicon(addr, 25) as HTMLCanvasElement;
            this.type_element.classList.add(`xe-account-list-item-outgoing`);
            this.type_element.replaceChildren();
            const text = document.createElement(`div`);
            text.innerHTML = `OUT TRANSFER`;
            this.type_element.appendChild(text);
            this.type_element.appendChild(to_icon);
            const addr_text = document.createElement(`div`);
            addr_text.innerHTML = format_address(addr);
            this.type_element.appendChild(addr_text);
        }

        if (history.dev_fee) {
            const xel_amount = format_xel(history.dev_fee.reward, true);
            this.type_element.innerHTML = `DEV FEE (${xel_amount})`;
        }

        if (history.mining) {
            const xel_amount = format_xel(history.mining.reward, true);
            this.type_element.innerHTML = `MINNING (${xel_amount})`;
        }

        if (history.burn) {
            const xel_amount = format_xel(history.burn.amount, true);
            this.type_element.innerHTML = `BURN (${xel_amount})`;
        }

        if (history.deploy_contract) {
            this.type_element.innerHTML = `DEPLOY CONTRACT`;
        }

        if (history.invoke_contract) {
            const contract_hash = reduce_text(history.invoke_contract.contract);
            this.type_element.innerHTML = `INVOKE CONTRACT (${contract_hash})`;
        }

        if (history.multi_sig) {
            const state = `${history.multi_sig.participants.length} / ${history.multi_sig.threshold}`;
            this.type_element.innerHTML = `MULTISIG (${state})`;
        }
    }
}