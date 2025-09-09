import { Container } from "../../../../components/container/container";
//@ts-ignore
import hashicon from "hashicon";
import QRCode from 'qrcode';

import './info.css';

export class AccountInfo {
    container: Container;

    hashicon_element: HTMLDivElement;
    addr_element: HTMLDivElement;
    registered_element: HTMLDivElement;
    nonce_element: HTMLDivElement;
    last_activity_element: HTMLDivElement;
    qr_code_element: HTMLCanvasElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-info`);

        this.hashicon_element = document.createElement(`div`);
        this.container.element.appendChild(this.hashicon_element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-account-info-container-1`);
        this.container.element.appendChild(container_1);

        this.addr_element = document.createElement(`div`);
        container_1.appendChild(this.addr_element);

        const container_2 = document.createElement(`div`);
        container_2.classList.add(`xe-account-info-container-2`);
        container_1.appendChild(container_2);

        this.last_activity_element = document.createElement(`div`);
        container_2.appendChild(this.last_activity_element);

        this.nonce_element = document.createElement(`div`);
        container_2.appendChild(this.nonce_element);

        this.registered_element = document.createElement(`div`);
        container_2.appendChild(this.registered_element);

        this.qr_code_element = document.createElement(`canvas`);
        this.container.element.appendChild(this.qr_code_element);
    }

    set(addr: string) {
        this.set_hashicon(addr);
        this.set_addr(addr);
        this.set_qrcode(addr);
        this.set_last_activity(0);
        this.set_nonce(123);
        this.set_registered(12);
    }

    set_hashicon(addr: string) {
        const addr_icon = hashicon(addr, 100) as HTMLCanvasElement;
        this.hashicon_element.replaceChildren();
        this.hashicon_element.appendChild(addr_icon);
    }

    set_addr(addr: string) {
        this.addr_element.innerHTML = addr;
    }

    set_last_activity(last_activity: number) {
        this.last_activity_element.innerHTML = `
            <div>LAST ACTIVITY</div>
            <div>${last_activity.toLocaleString()}</div>
            <div></div>
        `;
    }

    set_nonce(nonce: number) {
        this.nonce_element.innerHTML = `
            <div>NONCE</div>
            <div>${nonce.toLocaleString()}</div>
        `;
    }

    set_registered(registered: number) {
        this.registered_element.innerHTML = `
            <div>REGISTERED</div>
            <div>${registered.toLocaleString()}</div>
            <div></div>
        `;
    }

    set_qrcode(addr: string) {
        QRCode.toCanvas(this.qr_code_element, addr, {
            margin: 2,
            color: {
                dark: "#FFFFFF",
                light: "#000000"
            }
        });
    }
}