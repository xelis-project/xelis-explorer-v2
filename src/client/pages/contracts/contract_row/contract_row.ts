import { Block, GetContractBalanceResult, Transaction, TransactionResponse } from "@xelis/sdk/daemon/types";
import { reduce_text } from "../../../utils/reduce_text";
import { format_xel } from "../../../utils/format_xel";
import { Row } from "../../../components/table/row";

import './contract_row.css';

interface ContractInfo {
    name: string;
    transaction: TransactionResponse;
    balance?: GetContractBalanceResult;
}

export class ContractRow extends Row {
    constructor() {
        super(5);
    }

    set(contract_info: ContractInfo) {
        const transaction = contract_info.transaction;

        this.set_hash(transaction.hash);
        this.set_name(contract_info.name);
        this.set_xel_balance(0);

        this.set_link(`/contract/${transaction.hash}`);
    }

    set_hash(hash: string) {
        this.value_cells[0].innerHTML = reduce_text(hash);
    }

    set_name(name: string) {
        this.value_cells[1].innerHTML = name;
    }

    set_description(name: string) {
        this.value_cells[2].innerHTML = name;
    }

    set_xel_balance(balance: number) {
        this.value_cells[3].innerHTML = format_xel(balance, true);
    }

    set_registered() {
        this.value_cells[4].innerHTML = ``;
    }
}