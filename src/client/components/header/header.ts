import { App } from '../../app/app';
import { Localization } from '../../app/localization/localization';
import { svg_xelis_logo } from '../../assets/svg/xelis';
import './header.css';

export const menu_links = {
    "/": "DASHBOARD",
    "/blocks": "BLOCKS",
    "/transactions": "TRANSACTIONS",
    "/contracts": "CONTRACTS",
    "/mempool": "MEMPOOL",
    "/dag": "DAG",
    "/peers": "PEERS"
} as Record<string, string>;

export class Header {
    element: HTMLDivElement;
    link_container: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-header`);

        const logo = document.createElement(`div`);
        logo.classList.add(`xe-header-logo`);
        logo.innerHTML = `${svg_xelis_logo()} XELIS EXPLORER <div>V2</div>`;
        this.element.appendChild(logo);

        this.link_container = document.createElement(`div`);
        this.element.appendChild(this.link_container);

        Object.keys(menu_links).forEach((key) => {
            const text = menu_links[key];
            const link = document.createElement(`a`);
            link.href = key;
            link.innerHTML = Localization.instance().get_text(text);
            this.link_container.appendChild(link);
        });

        const app = App.instance();
        app.events.add_listener("page_load", () => {
            this.highlight_menu_link();
        });
    }

    highlight_menu_link() {
        for (let i = 0; i < this.link_container.children.length; i++) {
            const link = this.link_container.children[i] as HTMLLinkElement;
            link.classList.remove(`active`);

            const link_url = new URL(link.href);
            const current_url = new URL(window.location.href);
            if (link_url.pathname === current_url.pathname) {
                link.classList.add(`active`);
            }
        }
    }
}