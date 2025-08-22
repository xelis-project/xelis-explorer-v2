import { Singleton } from "../../utils/singleton";

import fr from './locales/fr';

export const translations = {
    "fr": fr,
} as Record<Locale, Record<string, string>>;

export type Locale = "en" | "fr";

export const supported_languages = [
    { title: "English", key: "en" },
    { title: "French", key: "fr" },
] as { title: string, key: Locale }[];

export class Localization extends Singleton<Localization> {
    locale: Locale;
    vars: Record<string, string[]>;

    constructor() {
        super();
        this.locale = "en";
        this.vars = {};
    }

    get_text(en_text: string, vars?: string[]) {
        let localized_text = en_text;

        if (this.locale !== `en`) {
            const lang_text = translations[this.locale][en_text];
            if (lang_text) localized_text = lang_text;
            console.warn(`Localized text not found: ${en_text}`);
        }

        if (vars) {
            vars.forEach((v) => {
                localized_text = localized_text.replace("{}", v);
            });
        }

        return localized_text;
    }

    set_element_text(element: HTMLElement, attr: "innerHTML" | "title", en_text: string, vars?: string[]) {
        element[attr] = this.get_text(en_text, vars);
        element.setAttribute(`${attr}-lang-key`, en_text);
        if (vars) this.vars[en_text] = vars;
    }

    update_elements() {
        const traverse = (element: HTMLElement) => {
            ["innerHTML", "title"].forEach((attr) => {
                const en_text = element.getAttribute(`${attr}-lang-key`);
                if (en_text) {
                    this.set_element_text(element, attr as any, en_text, this.vars[en_text]);
                } else {
                    for (let i = 0; i < element.children.length; i++) {
                        traverse(element.children[i] as HTMLElement);
                    }
                }
            });
        }

        traverse(document.body);
    }
}