import { get_addresses } from "../data/addresses";
import { reduce_text } from "./reduce_text";

export const format_address = (address: string) => {
    const addresses = get_addresses();
    const addr = addresses[address];
    if (addr) {
        return addr.name;
    }
    
    return reduce_text(address);
}