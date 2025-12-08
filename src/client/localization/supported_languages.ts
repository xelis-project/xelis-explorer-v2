import { Locale, localization } from "./localization";

export const get_supported_languages = () => {
    return [
        { title: localization.get_text(`English`), key: "en", flag: "us" },
        { title: localization.get_text(`French`), key: "fr", flag: "fr" },
        { title: localization.get_text(`Spanish`), key: "es", flag: "es" },
        { title: localization.get_text(`German`), key: "es", flag: "de" }
    ] as { title: string, key: Locale, flag: string }[];
}

export const validate_lang_key = (key?: string): Locale => {
    const lang = get_supported_languages().find(x => x.key === key);
    if (lang) return lang.key;
    return "en";
}
