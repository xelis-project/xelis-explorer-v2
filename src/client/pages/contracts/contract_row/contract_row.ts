import { GetContractBalanceResult } from "@xelis/sdk/daemon/types";
import { format_xel } from "../../../utils/format_xel";
import { Row } from "../../../components/table/row";
import { ContractInfo } from "../../../fetch_helpers/fetch_contracts";
import { format_hash } from "../../../utils/format_hash";

import './contract_row.css';

export class ContractRow extends Row {
    constructor() {
        super(5);
    }

    set(name: string, contract_info: ContractInfo) {
        const transaction = contract_info.transaction;
        console.log(transaction)
        this.set_hash(transaction.hash);
        this.set_name(name);
        //@ts-ignore
        this.set_xel_balance(contract_info.balance ? contract_info.balance.data : 0);
        this.set_xel_balance_topo(contract_info.balance);
        this.set_registered(contract_info.block.timestamp);

        this.set_link(`/contract/${transaction.hash}`);
    }

    set_hash(hash: string) {
        this.value_cells[0].innerHTML = format_hash(hash);
    }

    set_name(name: string) {
        this.value_cells[1].innerHTML = name;
    }

    set_xel_balance(balance: number) {
        this.value_cells[2].innerHTML = format_xel(balance, true);
    }

    set_xel_balance_topo(contract_balance?: GetContractBalanceResult) {
        this.value_cells[3].innerHTML = contract_balance ? contract_balance.topoheight.toLocaleString() : `--`;
    }

    set_registered(timestamp: number) {
        this.value_cells[4].innerHTML = new Date(timestamp).toLocaleString();
    }
}