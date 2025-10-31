import { App } from '../../app/app';
import { localization } from '../../localization/localization';
import icons from '../../assets/svg/icons';
import { svg_xelis_logo } from '../../assets/svg/xelis';

import './header.css';

interface LinkDef {
    text: string;
    icon: string;
}

export const get_menu_links = () => {
    return {
        "/": { text: localization.get_text(`DASHBOARD`), icon: icons.dashboard() },
        "/blocks": { text: localization.get_text(`BLOCKS`), icon: icons.blocks() },
        "/transactions": { text: localization.get_text(`TRANSACTIONS`), icon: icons.exchange() },
        "/accounts": { text: localization.get_text(`ACCOUNTS`), icon: icons.user() },
        "/contracts": { text: localization.get_text(`CONTRACTS`), icon: icons.contract() },
        "/mempool": { text: localization.get_text(`MEMPOOL`), icon: icons.compute() },
        "/dag": { text: localization.get_text(`DAG`), icon: icons.block_graph() },
        "/peers": { text: localization.get_text(`PEERS`), icon: icons.network() },
        "/settings": { text: localization.get_text(`SETTINGS`), icon: icons.cog() },
    } as Record<string, LinkDef>;
}

export class Header {
    element: HTMLDivElement;
    links_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-header`);

        const left_element = document.createElement(`div`);
        left_element.classList.add(`xe-header-left`);
        this.element.appendChild(left_element);

        const logo = document.createElement(`div`);
        logo.classList.add(`xe-header-logo`);
        logo.innerHTML = `${svg_xelis_logo()} XELIS EXPLORER`;
        left_element.appendChild(logo);

        const text = document.createElement(`div`);
        text.classList.add(`xe-header-text`);
        text.innerHTML = `Track and verify transactions on the XELIS network.`;
        left_element.appendChild(text);

        const mobile_menu_button = document.createElement(`button`);
        mobile_menu_button.classList.add(`xe-header-mobile-menu-button`);
        mobile_menu_button.innerHTML = `${icons.menu()}`;
        this.element.appendChild(mobile_menu_button);

        mobile_menu_button.addEventListener(`click`, async () => {
            this.links_element.classList.add(`open`);
        });

        this.links_element = document.createElement(`div`);
        this.links_element.classList.add(`xe-header-links`);

        window.addEventListener(`click`, async (e) => {
            const target = e.target as HTMLElement;

            if (!this.links_element.classList.contains(`open`)) return;
            if (mobile_menu_button.contains(target)) return;

            //if (!this.links_element.contains(target)) {
            this.links_element.classList.remove(`open`);
            this.links_element.classList.add(`close`);
            setTimeout(() => this.links_element.classList.remove(`close`), 250);
            //}
        });

        this.element.appendChild(this.links_element);

        const menu_links = get_menu_links();
        Object.keys(menu_links).forEach((key) => {
            const link_def = menu_links[key];
            const link = document.createElement(`a`);
            link.href = key;
            const text = link_def.text;
            link.innerHTML = `${link_def.icon}${text}`;
            this.links_element.appendChild(link);
        });

        const app = App.instance();
        app.events.add_listener("page_load", () => {
            this.highlight_menu_link();
        });
    }

    highlight_menu_link() {
        const anchors = this.links_element.querySelectorAll(`a`);
        for (let i = 0; i < anchors.length; i++) {
            const link = this.links_element.children[i] as HTMLAnchorElement;
            link.classList.remove(`active`);

            const link_url = new URL(link.href);
            const current_url = new URL(window.location.href);
            if (link_url.pathname === current_url.pathname) {
                link.classList.add(`active`);
            }
        }
    }
}