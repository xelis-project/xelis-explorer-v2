import { App } from '../../app/app';
import { Localization } from '../../app/localization/localization';
import icons from '../../assets/svg/icons';
import { svg_xelis_logo } from '../../assets/svg/xelis';
import './header.css';

interface LinkDef {
    text: string;
    icon: string;
}

export const menu_links = {
    "/": { text: "DASHBOARD", icon: icons.dashboard() },
    "/blocks": { text: "BLOCKS", icon: icons.blocks() },
    "/transactions": { text: "TRANSACTIONS", icon: icons.exchange() },
    "/accounts": { text: "ACCOUNTS", icon: icons.user() },
    "/contracts": { text: "CONTRACTS", icon: icons.contract() },
    "/mempool": { text: "MEMPOOL", icon: icons.compute() },
    "/dag": { text: "DAG", icon: icons.block_graph() },
    "/peers": { text: "PEERS", icon: icons.network() }
} as Record<string, LinkDef>;

export class Header {
    element: HTMLDivElement;
    links_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-header`);

        const logo = document.createElement(`div`);
        logo.classList.add(`xe-header-logo`);
        logo.innerHTML = `${svg_xelis_logo()} XELIS EXPLORER`;
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
            const link_def = menu_links[key];
            const link = document.createElement(`a`);
            link.href = key;
            const text = Localization.instance().get_text(link_def.text);
            link.innerHTML = `${link_def.icon}${text}`;
            this.links_element.appendChild(link);
        });

        const settings_btn = document.createElement(`button`);
        settings_btn.innerHTML = `${icons.cog()} SETTINGS`;
        settings_btn.addEventListener(`click`, () => {

        });
        this.links_element.appendChild(settings_btn);

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