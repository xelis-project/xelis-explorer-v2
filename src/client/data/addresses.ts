import dev_addresses from './dev/addresses.json';
import testnet_addresses from './testnet/addresses.json';
import mainnet_addresses from './mainnet/addresses.json';

export type AddressType = "exchange" | "miscellaneous" | "pool";

export interface AddressInfo {
    name: string;
    link: string;
    type: AddressType | string;
}

export type Addresses = Record<string, AddressInfo>;

export const get_addresses = (address_type?: AddressType) => {
    let addresses = {} as Addresses;

    switch (import.meta.env.MODE) {
        case "mainnet":
            addresses = mainnet_addresses;
            break;
        case "testnet":
            addresses = testnet_addresses;
            break;
        default:
            addresses = dev_addresses;
            break;
    }

    if (address_type) {
        const filtered_addresses = {} as Addresses;
        Object.keys(addresses).forEach((addr) => {
            const address = addresses[addr];
            if (address.type === address_type) {
                filtered_addresses[addr] = address;
            }
        });
        return filtered_addresses;
    }

    return addresses;
}
