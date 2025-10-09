import { Page } from "../page";
import { Master } from "../../components/master/master";
import { Table } from "../../components/table/table";
import { Container } from "../../components/container/container";
import { AccountRow, AccountRowData } from "./account_row/account_row";
import { get_addresses } from "../../data/addresses";
import { fetch_accounts } from "../../fetch_helpers/fetch_accounts";

import './accounts.css';

export class AccountsPage extends Page {
    static pathname = "/accounts";
    static title = "Accounts";

    master: Master;

    misc_container_table: Container;
    misc_table: Table;

    pool_container_table: Container;
    pool_table: Table;

    exchange_container_table: Container;
    exchange_table: Table;

    account_rows: AccountRow[];

    constructor() {
        super();

        this.account_rows = [];

        this.master = new Master();
        this.element.appendChild(this.master.element);
        this.master.content.classList.add(`xe-accounts`);

        const titles = ["NAME", "ADDRESS", "LINK", "REGISTRATION TOPO", "IN TOPO", "OUT TOPO", "BALANCE"];

        // misc table
        this.misc_container_table = new Container();
        this.misc_container_table.element.classList.add(`xe-accounts-table`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.master.content.appendChild(this.misc_container_table.element);

        this.misc_table = new Table();
        this.misc_table.set_clickable();
        this.misc_container_table.element.appendChild(this.misc_table.element);
        this.misc_table.set_head_row(titles);

        // exchange table
        this.exchange_container_table = new Container();
        this.exchange_container_table.element.classList.add(`xe-accounts-table`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.master.content.appendChild(this.exchange_container_table.element);

        this.exchange_table = new Table();
        this.exchange_table.set_clickable();
        this.exchange_container_table.element.appendChild(this.exchange_table.element);
        this.exchange_table.set_head_row(titles);

        // pool table
        this.pool_container_table = new Container();
        this.pool_container_table.element.classList.add(`xe-accounts-table`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.master.content.appendChild(this.pool_container_table.element);

        this.pool_table = new Table();
        this.pool_table.set_clickable();
        this.pool_container_table.element.appendChild(this.pool_table.element);
        this.pool_table.set_head_row(titles);
    }

    async load_account_table(table: Table, addr_list: string[]) {
        let accounts = [] as AccountRowData[];
        for (let i = 0; i < addr_list.length; i += 6) {

            const addr_batch = addr_list.slice(i, i + 6);
            const data = await fetch_accounts(addr_batch);
            data.forEach((item, i) => {
                const addr = addr_batch[i];
                const addresses = get_addresses();
                const addr_info = addresses[addr];

                const registration_topo = item[0];
                const balance = item[1];
                const nonce = item[2];

                accounts.push({
                    addr: addr,
                    in_topo: balance.topoheight,
                    out_topo: nonce.topoheight,
                    name: addr_info.name,
                    registration_topo,
                    link: addr_info.link
                });
            });
        }
        table.body_element.replaceChildren();
        accounts.forEach((account_data) => {
            const row = new AccountRow();
            row.set(account_data);
            table.prepend_row(row.element);
        });
    }

    async load(parent: HTMLElement) {
        super.load(parent);
        this.set_window_title(AccountsPage.title);

        const miscellaneous = get_addresses("miscellaneous");
        const exchanges = get_addresses("exchange");
        const pools = get_addresses("pool");

        const misc_addr_keys = Object.keys(miscellaneous);
        const exchange_addr_keys = Object.keys(exchanges);
        const pool_addr_keys = Object.keys(pools);

        this.misc_table.set_loading(misc_addr_keys.length);
        this.exchange_table.set_loading(exchange_addr_keys.length);
        this.pool_table.set_loading(pool_addr_keys.length);

        this.load_account_table(this.misc_table, misc_addr_keys);
        this.load_account_table(this.exchange_table, exchange_addr_keys);
        this.load_account_table(this.pool_table, pool_addr_keys);
    }

    unload() {
        super.unload();
    }
}