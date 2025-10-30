import { Settings } from "../app/settings";
import { reduce_text } from "./reduce_text";

export function format_hash(hash: string) {
    const settings = Settings.instance();

    let left_max = 0;
    let right_max = 0;
    switch (settings.hash_format) {
        case "front":
            left_max = 0;
            right_max = 10;
            break;
        case "back":
            left_max = 10;
            right_max = 0;
            break;
        case "middle":
            left_max = 5;
            right_max = 5;
            break;
    }

    return reduce_text(hash, left_max, right_max);
}