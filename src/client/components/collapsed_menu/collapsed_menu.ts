import './collapsed_menu.css';

import { menu_links } from '../header/header';
import { Localization } from '../../app/localization/localization';
import icons from '../../assets/svg/icons';

export class CollapsedMenu {
    element: HTMLElement;
    toggle_element: HTMLButtonElement;
    links_element: HTMLElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-collapsed-menu`);

        this.toggle_element = document.createElement(`button`);
        this.toggle_element.classList.add(`xe-collapsed-menu-toggle`);
        this.toggle_element.addEventListener(`click`, () => {
            if (this.links_element.classList.contains(`open`)) {
                this.links_element.classList.remove(`open`);
                this.links_element.classList.add(`close`);
                setTimeout(() => this.links_element.classList.remove(`close`), 250);
            } else {
                this.links_element.classList.add(`open`);
            }
        });
        this.toggle_element.title = `Toggle menu`;
        this.toggle_element.innerHTML = icons.menu_alt();
        this.element.appendChild(this.toggle_element);

        this.links_element = document.createElement(`div`);
        this.links_element.classList.add(`xe-collapsed-menu-links`);
        this.element.appendChild(this.links_element);

        Object.keys(menu_links).forEach(key => {
            const link_def = menu_links[key];
            const link = document.createElement(`a`);
            link.href = key;
            const text = Localization.instance().get_text(link_def.text);
            link.innerHTML = `${link_def.icon}${text}`;
            this.links_element.appendChild(link);
        });

        window.addEventListener(`click`, async (e) => {
            const target = e.target as HTMLElement;

            if (!this.links_element.classList.contains(`open`)) return;
            if (this.toggle_element.contains(target)) return;

            //if (!this.links_element.contains(target)) {
            this.links_element.classList.remove(`open`);
            this.links_element.classList.add(`close`);
            setTimeout(() => this.links_element.classList.remove(`close`), 250);
            //}
        });
    }
}