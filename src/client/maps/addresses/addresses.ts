import { pools } from "./pools";
import { exchanges } from "./exchanges";
import { miscellaneous } from "./miscellaneous";

export interface AddressDetails {
    name: string;
    link: string;
}

export default { ...pools, ...exchanges, ...miscellaneous } as Record<string, AddressDetails>;
