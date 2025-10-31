import { Singleton } from "../utils/singleton";
import { Locale, localization } from "../localization/localization";
import Cookies from 'js-cookie';
import { validate_lang_key } from "../localization/supported_languages";

export type SettingsHashFormat = "front" | "middle" | "back";
export const hash_formats = ["front", "middle", "back"];

export type SettingsMenuType = "header_menu" | "collapsed_menu";
export const menu_types = ["header_menu", "collapsed_menu"];

export function valid_menu_types(value: string) {
    return menu_types.indexOf(value) !== -1;
}

export class Settings extends Singleton {
    language: Locale;
    hash_format: SettingsHashFormat;
    menu_type: SettingsMenuType;

    constructor() {
        super();

        // language
        this.language = validate_lang_key(Cookies.get(`language`));
        localization.locale = this.language;

        // hash format
        const hash_format = localStorage.getItem(`hash_format`);
        if (hash_format && hash_formats.indexOf(hash_format) !== -1) {
            this.hash_format = hash_format as SettingsHashFormat;
        } else {
            this.hash_format = "middle";
        }

        // menu type
        const menu_type = localStorage.getItem(`menu_type`);
        if (menu_type && menu_types.indexOf(menu_type) !== -1) {
            this.menu_type = menu_type as SettingsMenuType;
        } else {
            this.menu_type = "header_menu";
        }
    }

    save() {
        Cookies.set(`language`, this.language, {
            path: '/',
            sameSite: 'Strict',
            secure: true,
            expires: 31536000,
            domain: ``
        });

        localStorage.setItem(`hash_format`, this.hash_format);
        localStorage.setItem(`menu_type`, this.menu_type);
    }
}