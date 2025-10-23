import { Page } from "../page";
import { Master } from "../../components/master/master";
import { Container } from "../../components/container/container";
import { SettingsItem } from "./settings_item/settings_item";

import './settings.css';
import { supported_languages } from "../../app/localization/localization";
import { Select } from "../../components/select/select";

export class SettingsPage extends Page {
    static pathname = "/settings";
    static title = "Settings";

    master: Master;

    constructor() {
        super();

        this.master = new Master();
        this.master.content.classList.add(`xe-settings`);
        this.element.appendChild(this.master.element);

        const container = new Container();
        this.master.content.appendChild(container.element);

        function append_line() {
            const line = document.createElement(`div`);
            line.classList.add(`xe-settings-line`);
            container.element.appendChild(line);
        }

        const language_item = new SettingsItem(`LANGUAGE`, `Choose desired language`);
        container.element.appendChild(language_item.element);

        const language_select = new Select();
        supported_languages.forEach((lang) => {
            language_select.add_item(lang.key, lang.title.toUpperCase());
        });
        language_select.set_value(`ENGLISH`);

        language_item.input_element.appendChild(language_select.element);

        append_line();

        const hash_display_item = new SettingsItem(`HASH DISPLAY`, `Choose desired hash truncation format`);
        container.element.appendChild(hash_display_item.element);

        const hash_display_select = new Select();
        hash_display_select.add_item(`FRONT`, `FRONT (...00000000)`);
        hash_display_select.add_item(`MIDDLE`, `MIDDLE (0000...0000)`);
        hash_display_select.add_item(`BACK`, `BACK (00000000...)`);
        hash_display_select.set_value(`MIDDLE`);

        hash_display_item.input_element.appendChild(hash_display_select.element);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(SettingsPage.title);
    }
}