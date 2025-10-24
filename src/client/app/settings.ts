import { Singleton } from "../utils/singleton";
import { Locale, Localization, validate_lang_key } from "./localization/localization";
import Cookies from 'js-cookie';

type HashFormat = "front" | "middle" | "back";

export class Settings extends Singleton {
    language: Locale;
    hash_format: HashFormat;
    display_hashicon: boolean;

    constructor() {
        super();

        this.language = validate_lang_key(Cookies.get(`language`));
        const localization = Localization.instance();
        localization.locale = this.language;

        this.hash_format = "middle";
        this.display_hashicon = true;
    }

    save() {
        const localization = Localization.instance();
        localization.locale = this.language;
        Cookies.set(`language`, this.language, {
            path: '/',
            sameSite: 'Strict',
            secure: true,
            expires: 31536000,
            domain: ``
        });

        location.reload();
    }
}