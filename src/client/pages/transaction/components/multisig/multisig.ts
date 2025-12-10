import { MultiSigPayload } from "@xelis/sdk/daemon/types";
import { Box } from "../../../../components/box/box";
import { Container } from "../../../../components/container/container";
import { localization } from "../../../../localization/localization";

import './multisig.css';

export class TransactionMultiSig {
    container: Container;

    constructor(multisig: MultiSigPayload) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-multisig`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`MULTI SIG`);
        this.container.element.appendChild(title_element);

        const threshold_title = document.createElement(`div`);
        threshold_title.innerHTML = localization.get_text(`THRESHOLD`);
        this.container.element.appendChild(threshold_title);

        const threshold_value = document.createElement(`div`);
        threshold_value.innerHTML = multisig.threshold.toLocaleString(undefined, { minimumIntegerDigits: 3 });
        this.container.element.appendChild(threshold_value);

        const participants_title = document.createElement(`div`);
        participants_title.innerHTML = localization.get_text(`PARTICIPANTS`);

        this.container.element.appendChild(participants_title);

        const participants_box = new Box();
        participants_box.element.classList.add(`xe-transaction-multisig-participants`);
        this.container.element.appendChild(participants_box.element);

        multisig.participants.forEach((participant, i) => {
            const item_element = document.createElement(`div`);

            const index_element = document.createElement(`div`);
            index_element.innerHTML = `${i.toLocaleString(undefined, { minimumIntegerDigits: 3 })}`;
            item_element.appendChild(index_element);

            const key_element = document.createElement(`div`);
            key_element.innerHTML = participant.map((x) => x.toString(16)).join(``);
            item_element.appendChild(key_element);

            participants_box.element.appendChild(item_element);
        });
    }
}