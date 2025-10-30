import { get_addresses } from "../data/addresses";
import { format_hash } from "./format_hash";

export const format_address = (address: string) => {
    const addresses = get_addresses();
    const addr = addresses[address];
    if (addr) {
        return addr.name;
    }
    
    return format_hash(address);
}