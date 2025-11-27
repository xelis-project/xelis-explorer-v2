//@ts-ignore
import { Row } from "../../../components/table/row";
import { format_hash } from "../../../utils/format_hash";
import { localization } from "../../../localization/localization";

import './account_row.css';

export interface AccountRowData {
    addr: string;
    registration_topo: number;
    in_topo: number;
    out_topo: number;
}

export class AccountRow extends Row {
    constructor() {
        super(6);
    }

    set(account_data: AccountRowData) {
        this.set_addr(account_data.addr);
        this.set_registration_topo(account_data.registration_topo);
        this.set_in_topo(account_data.in_topo);
        this.set_out_topo(account_data.out_topo);
        this.set_balance();
    }

    set_addr(addr: string) {
        this.value_cells[0].innerHTML = `${format_hash(addr)}`;
    }

    set_registration_topo(topo: number) {
        this.value_cells[1].innerHTML = `${topo.toLocaleString()}`;
    }

    set_in_topo(topo: number) {
        this.value_cells[2].innerHTML = `${topo.toLocaleString()}`;
    }

    set_out_topo(topo: number) {
        this.value_cells[3].innerHTML = `${topo.toLocaleString()}`;
    }

    set_balance() {
        this.value_cells[4].innerHTML = localization.get_text(`ENCRYPTED`);
    }
}