import { Container } from "../../../../components/container/container";
import { hashicon } from '@emeraldpay/hashicon';
import QRCode from 'qrcode';
import { AccountServerData } from "../../account";
import prettyMilliseconds from "pretty-ms";
import { localization } from "../../../../localization/localization";

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
        this.container.element.classList.add(`xe-account-info`, `scrollbar-1`, `scrollbar-1-bottom`);

        this.hashicon_element = document.createElement(`div`);
        this.hashicon_element.classList.add(`xe-account-info-icon`);
        this.container.element.appendChild(this.hashicon_element);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-account-info-container-1`);
        this.container.element.appendChild(container_1);

        this.addr_element = document.createElement(`div`);
        this.addr_element.classList.add(`xe-account-info-addr`);
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
        this.qr_code_element.classList.add(`xe-account-info-qr`);
        this.container.element.appendChild(this.qr_code_element);
    }

    set(addr: string, data: AccountServerData) {
        this.set_hashicon(addr);
        this.set_addr(addr);
        this.set_qrcode(addr);
        this.set_last_activity(data.balance.topoheight, data.last_activity_timestamp);
        this.set_nonce(data.nonce.nonce);
        this.set_registered(data.registration_topoheight, data.registration_timestamp);
    }

    set_hashicon(addr: string) {
        const addr_icon = hashicon(addr, 90) as HTMLCanvasElement;
        this.hashicon_element.replaceChildren();
        this.hashicon_element.appendChild(addr_icon);
    }

    set_addr(addr: string) {
        this.addr_element.innerHTML = addr;
    }

    last_activity_interval_id?: number;
    set_last_activity(topoheight: number, timestamp: number) {
        const set_last_activity = () => {
            this.last_activity_element.innerHTML = `
                <div>${localization.get_text(`LAST ACTIVITY`)}</div>
                <div>${topoheight.toLocaleString()} (${prettyMilliseconds(Date.now() - timestamp, { compact: true })})</div>
                <div>${new Date(timestamp).toLocaleString()}</div>
            `;
        }

        set_last_activity();
        if (this.last_activity_interval_id) window.clearInterval(this.last_activity_interval_id);
        this.last_activity_interval_id = window.setInterval(set_last_activity, 1000);
    }

    /*
    set_last_activity(topoheight: number, timestamp: number) {
        this.last_activity_element.innerHTML = `
            <div>LAST ACTIVITY</div>
            <div>${topoheight.toLocaleString()} (${prettyMilliseconds(Date.now() - timestamp, { compact: true })})</div>
            <div>${new Date(timestamp).toLocaleString()}</div>
        `;
    }*/

    set_nonce(nonce: number) {
        this.nonce_element.innerHTML = `
            <div>NONCE</div>
            <div>${nonce.toLocaleString()}</div>
        `;
    }

    set_registered(topoheight: number, timestamp: number) {
        this.registered_element.innerHTML = `
            <div>REGISTERED</div>
            <div>${topoheight.toLocaleString()} (${prettyMilliseconds(Date.now() - timestamp, { compact: true })})</div>
            <div>${new Date(timestamp).toLocaleString()}</div>
        `;
    }

    set_qrcode(addr: string) {
        QRCode.toCanvas(this.qr_code_element, addr, {
            margin: 4,
            scale: 3,
            color: {
                dark: "#FFFFFF",
                light: "#00000030"
            }
        });
    }
}