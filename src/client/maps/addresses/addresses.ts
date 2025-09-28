import { pools } from "./pools";
import { exchanges } from "./exchanges";
import { miscellaneous } from "./miscellaneous";

export interface AddressDetails {
    name: string;
    link: string;
}

const all = { ...pools, ...exchanges, ...miscellaneous };

export default { all, pools, exchanges, miscellaneous };
