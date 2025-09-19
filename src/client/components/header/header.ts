import { App } from '../../app/app';
import { Localization } from '../../app/localization/localization';
import icons from '../../assets/svg/icons';
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
    links_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-header`);

        const logo = document.createElement(`div`);
        logo.classList.add(`xe-header-logo`);
        logo.innerHTML = `${svg_xelis_logo()} XELIS EXPLORER <div>V2</div>`;
        this.element.appendChild(logo);

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

            if (!this.links_element.contains(target)) {
                this.links_element.classList.remove(`open`);
                this.links_element.classList.add(`close`);
                setTimeout(() => this.links_element.classList.remove(`close`), 250);
            }
        });

        this.element.appendChild(this.links_element);

        Object.keys(menu_links).forEach((key) => {
            const text = menu_links[key];
            const link = document.createElement(`a`);
            link.href = key;
            link.innerHTML = Localization.instance().get_text(text);
            this.links_element.appendChild(link);
        });

        const app = App.instance();
        app.events.add_listener("page_load", () => {
            this.highlight_menu_link();
        });
    }

    highlight_menu_link() {
        for (let i = 0; i < this.links_element.children.length; i++) {
            const link = this.links_element.children[i] as HTMLLinkElement;
            link.classList.remove(`active`);

            const link_url = new URL(link.href);
            const current_url = new URL(window.location.href);
            if (link_url.pathname === current_url.pathname) {
                link.classList.add(`active`);
            }
        }
    }
}