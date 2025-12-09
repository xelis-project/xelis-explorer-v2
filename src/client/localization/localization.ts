import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import de from './locales/de';
import id from './locales/id';

export type Locale = "en" | "fr" | "es" | "de" | "id";

class Localization {
    locale: Locale;
    vars: Record<string, string[]>;
    translations: Record<string, Record<string, string>>;

    constructor() {
        this.locale = "en";
        this.vars = {};
        this.translations = {
            "en": en,
            "fr": fr,
            "es": es,
            "de": de,
            "id": id
        };
    }

    get_text(en_text: string, vars?: string[]) {
        let localized_text = en_text;

        if (this.locale !== `en`) {
            const lang_text = this.translations[this.locale][en_text];
            if (lang_text) localized_text = lang_text;
            else console.warn(`Localized text not found: ${en_text}`);
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

export const localization = new Localization();
