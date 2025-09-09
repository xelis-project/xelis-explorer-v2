import prettyMilliseconds from "pretty-ms";
import { Box } from "../../../../components/box/box";
import { reduce_text } from "../../../../utils/reduce_text";
import { AccountHistory, TransactionData } from "@xelis/sdk/daemon/types";
import { format_xel } from "../../../../utils/format_xel";

export class AccountHistoryListItem {
    box: Box;

    hash_element: HTMLDivElement;
    height_element: HTMLDivElement;
    age_element: HTMLDivElement;
    type_element: HTMLDivElement;

    constructor() {
        this.box = new Box();
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
            const addr = reduce_text(history.incoming.from);
            this.type_element.innerHTML = `INCOMING (${addr})`;
        }

        if (history.outgoing) {
            const addr = reduce_text(history.outgoing.to);
            this.type_element.innerHTML = `OUTGOING (${addr})`;
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