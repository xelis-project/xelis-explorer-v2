import icons from "../../../../assets/svg/icons";
import { Container } from "../../../../components/container/container";
import { get_addresses } from "../../../../data/addresses";
import { localization } from "../../../../localization/localization";

import "./known_addr.css";

export class AccountKnownAddr {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-known-addr`);
    }

    set(address: string) {
        const addresses = get_addresses();
        const address_details = addresses[address];

        if (address_details) {
            this.container.element.style.removeProperty(`display`);
            const { name, link } = address_details;
            this.container.element.innerHTML = `
            ${icons.tag()}
            <div>
                <div>${localization.get_text(`This is a known address: {}`, [`<span>${name}</span>`])}</div>
                ${link && `<div>${localization.get_text(`You can visit the website at {}.`, [`<a href="${link}" target="_blank">${link}</a>`])}</div>`}
            </div>
        `;
        } else {
            this.container.element.style.display = `none`;
        }
    }
}