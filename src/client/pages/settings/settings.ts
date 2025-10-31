import { Page } from "../page";
import { Master } from "../../components/master/master";
import { Container } from "../../components/container/container";
import { SettingsItem } from "./settings_item/settings_item";
import { localization } from "../../localization/localization";
import { Select } from "../../components/select/select";
import { Settings, SettingsHashFormat, SettingsMenuType } from "../../app/settings";
import { get_supported_languages, validate_lang_key } from "../../localization/supported_languages";
import { Context } from "hono";
import { ServerApp } from "../../../server";

import './settings.css';

export class SettingsPage extends Page {
    static pathname = "/settings";

    static async handle_server(c: Context<ServerApp>) {
        this.title = localization.get_text(`Settings`);
    }

    master: Master;

    constructor() {
        super();

        const settings = Settings.instance();

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

        const language_item = new SettingsItem();
        language_item.title_element.innerHTML = localization.get_text(`LANGUAGE`);
        language_item.description_element.innerHTML = localization.get_text(`Choose desired language`);
        container.element.appendChild(language_item.element);

        const language_select = new Select();
        get_supported_languages().forEach((lang) => {
            language_select.add_item(lang.key, `
                <i class="fi fi-${lang.flag}"></i>
                <div>${lang.title.toUpperCase()}</div>
            `);

            if (settings.language === lang.key) {
                language_select.set_value(`
                   <i class="fi fi-${lang.flag}"></i>
                    <div>${lang.title.toUpperCase()}</div>
                `);
            }
        });

        language_select.add_listener(`change`, (key) => {
            settings.language = validate_lang_key(key);
            settings.save();
            location.reload();
        });

        language_item.input_element.appendChild(language_select.element);

        append_line();

        const hash_format_item = new SettingsItem();
        hash_format_item.title_element.innerHTML = localization.get_text(`HASH FORMAT`);
        hash_format_item.description_element.innerHTML = localization.get_text(`Choose desired hash truncation format`);
        container.element.appendChild(hash_format_item.element);

        const hash_formats = {
            "front": localization.get_text(`FRONT ({})`, [`...00000000`]),
            "middle": localization.get_text(`MIDDLE ({})`, [`0000...0000`]),
            "back": localization.get_text(`BACK ({})`, [`00000000...`]),
        } as Record<string, string>;

        const hash_format_select = new Select();
        Object.keys(hash_formats).forEach((key) => {
            hash_format_select.add_item(key, hash_formats[key]);
        });
        hash_format_select.set_value(hash_formats[settings.hash_format]);

        hash_format_select.add_listener(`change`, (key) => {
            if (key) {
                settings.hash_format = key as SettingsHashFormat;
                settings.save();
            }
        });

        hash_format_item.input_element.appendChild(hash_format_select.element);

        append_line();

        const menu_type_item = new SettingsItem();
        menu_type_item.title_element.innerHTML = localization.get_text(`MENU TYPE`);
        menu_type_item.description_element.innerHTML = localization.get_text(`Display standard header menu or collapsed menu`);
        container.element.appendChild(menu_type_item.element);

        const menu_types = {
            "header_menu": localization.get_text("HEADER MENU"),
            "collapsed_menu": localization.get_text("COLLAPSED MENU")
        } as Record<string, string>;

        const menu_type_select = new Select();
        Object.keys(menu_types).forEach((key) => {
            menu_type_select.add_item(key, menu_types[key]);
        });

        menu_type_select.set_value(menu_types[settings.menu_type]);

        menu_type_select.add_listener(`change`, (key) => {
            if (key) {
                settings.menu_type = key as SettingsMenuType;
                settings.save();
                location.reload();
            }
        });

        menu_type_item.input_element.appendChild(menu_type_select.element);
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(localization.get_text(`Settings`));
    }
}