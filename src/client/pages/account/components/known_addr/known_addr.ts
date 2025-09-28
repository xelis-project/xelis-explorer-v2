import icons from "../../../../assets/svg/icons";
import { Container } from "../../../../components/container/container";
import addresses from "../../../../maps/addresses/addresses";

import "./known_addr.css";

export class AccountKnownAddr {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-known-addr`);
    }

    set(addr: string) {
        const address_details = addresses[addr];

        if (address_details) {
            this.container.element.style.removeProperty(`display`);
            const { name, link } = address_details;
            this.container.element.innerHTML = `
            ${icons.tag()}
            <div>
                <div>This is a known address: <span>${name}</span></div>
                ${link && `<div>You can visit the website at <a href="${link}" target="_blank">${link}</a>.</div>`}
            </div>
        `;
        } else {
            this.container.element.style.display = `none`;
        }
    }
}