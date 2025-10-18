import dev_contracts from './dev/contracts.json';
import testnet_contracts from './testnet/contracts.json';
import mainnet_contracts from './mainnet/contracts.json';

export interface Contract {
    name: string;
    description: string;
}

export type Contracts = Record<string, Contract>;

export const get_contracts = () => {
    let contracts = {} as Contracts;

    switch (import.meta.env.MODE) {
        case "mainnet":
            contracts = mainnet_contracts;
            break;
        case "testnet":
            contracts = testnet_contracts;
            break;
        default:
            contracts = dev_contracts;
            break;
    }

    return contracts;
}
