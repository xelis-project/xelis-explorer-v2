import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';
import { Table } from '../../../../components/table/table';
import { Select } from '../../../../components/select/select';
import { XelisNode } from '../../../../app/xelis_node';
import { HistoryRow } from './history_row/history_row';
import { AssetWithData } from '@xelis/sdk/daemon/types';
import icons from '../../../../assets/svg/icons';
import { AccountServerData } from '../../account';
import { format_hash } from '../../../../utils/format_hash';

import './history.css';

export class AccountHistory {
    container: Container;
    table: Table;
    flow_filter_select: Select;
    asset_filter_select: Select;
    prev_btn: HTMLButtonElement;
    next_btn: HTMLButtonElement;
    topo_status: HTMLDivElement;
    pager_container: HTMLDivElement;

    account_server_data?: AccountServerData;
    addr?: string;
    filter_asset?: string;
    filter_direction?: string;

    pager_topos: number[] = [];
    pager_max_topo?: number;
    pager_min_topo?: number;

    history_rows: HistoryRow[];

    constructor() {
        this.history_rows = [];

        this.container = new Container();
        this.container.element.classList.add(`xe-account-history`);

        const titles = [
            localization.get_text(`TOPOHEIGHT`),
            localization.get_text(`HASH`),
            localization.get_text(`ACTION`),
            localization.get_text(`ACCOUNT`),
            localization.get_text(`AMOUNT`),
            localization.get_text(`AGE`)
        ];

        const top_container = document.createElement(`div`);
        this.container.element.appendChild(top_container);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`HISTORY`);
        top_container.appendChild(title_element);

        const controls_container = document.createElement(`div`);
        top_container.appendChild(controls_container);

        const flow_filters = {
            "all": `<span class="all">${icons.dual_arrow()}</span>` + localization.get_text(`All Directions`),
            "incoming": `<span class="incoming">${icons.arrow()}</span>` + localization.get_text(`Incoming`),
            "outgoing": `<span class="outgoing">${icons.arrow()}</span>` + localization.get_text(`Outgoing`)
        } as Record<string, string>;

        this.flow_filter_select = new Select();
        this.flow_filter_select.element.classList.add(`xe-account-history-flow-filters`);
        Object.keys(flow_filters).forEach((key) => {
            this.flow_filter_select.add_item(key, flow_filters[key]);
        });
        this.flow_filter_select.set_value(flow_filters[`all`]);

        this.flow_filter_select.add_listener(`change`, (key) => {
            this.filter_direction = key;
            this.load_history();
        });

        controls_container.appendChild(this.flow_filter_select.element);

        this.asset_filter_select = new Select();
        this.asset_filter_select.set_value(localization.get_text(`All Assets`));
        this.asset_filter_select.add_listener(`change`, (key) => {
            this.filter_asset = key;
            this.load_history();
        });

        controls_container.appendChild(this.asset_filter_select.element);

        this.table = new Table();
        this.table.element.classList.add(`scrollbar-1`, `scrollbar-1-right`);
        this.table.set_clickable();
        this.container.element.appendChild(this.table.element);
        this.table.set_head_row(titles);

        this.pager_container = document.createElement(`div`);
        this.pager_container.classList.add(`xe-account-history-pager`);
        this.container.element.appendChild(this.pager_container);

        this.prev_btn = document.createElement(`button`);
        this.prev_btn.classList.add(`prev`);
        this.prev_btn.innerHTML = icons.arrow() + `PREV`;
        this.prev_btn.addEventListener(`click`, () => {
            this.pager_topos.pop();
            this.load_history();
        });

        this.next_btn = document.createElement(`button`);
        this.next_btn.classList.add(`next`);
        this.next_btn.innerHTML = `NEXT` + icons.arrow();
        this.next_btn.addEventListener(`click`, () => {
            if (!this.pager_min_topo) return;
            this.pager_topos.push(this.pager_min_topo - 1); // next topo
            this.load_history();
        });

        this.topo_status = document.createElement(`div`);
    }

    set_filter_assets(assets: AssetWithData[]) {
        this.asset_filter_select.clear();

        this.asset_filter_select.set_value(localization.get_text(`All Assets`));
        this.asset_filter_select.add_item(``, localization.get_text(`All Assets`));
        assets.forEach((asset) => {
            this.asset_filter_select.add_item(asset.asset, `${asset.name} (${format_hash(asset.asset)})`);
        });
    }

    async set(addr: string, data: AccountServerData, assets: AssetWithData[]) {
        this.addr = addr;
        this.account_server_data = data;

        this.set_filter_assets(assets);
        await this.load_history();
    }

    render_pager() {
        if (!this.pager_max_topo || !this.pager_min_topo || !this.account_server_data) {
            return;
        }

        this.pager_container.replaceChildren();
        const last_topo = this.account_server_data.balance.topoheight;
        const first_topo = this.account_server_data.registration_topoheight;

        if (this.pager_max_topo < last_topo) {
            this.pager_container.appendChild(this.prev_btn);
        }

        if (this.pager_min_topo > first_topo) {
            this.pager_container.appendChild(this.next_btn);
        }

        const max_topo_string = this.pager_max_topo.toLocaleString();
        const min_topo_string = this.pager_min_topo.toLocaleString();
        this.topo_status.innerHTML = `From ${max_topo_string} to ${min_topo_string}`;
        this.pager_container.appendChild(this.topo_status);
    }

    async load_history() {
        if (!this.addr) return;

        this.history_rows = [];
        this.table.body_element.replaceChildren();

        const xelis_node = XelisNode.instance();

        let incoming = true;
        let outgoing = true;
        switch (this.filter_direction) {
            case "incoming":
                outgoing = false;
                break;
            case "outgoing":
                incoming = false;
                break;
        }

        this.table.set_loading(20);

        const max_topo = this.pager_topos[this.pager_topos.length - 1];
        const history = await xelis_node.rpc.getAccountHistory({
            address: this.addr,
            asset: this.filter_asset ? this.filter_asset : undefined,
            incoming_flow: incoming,
            outgoing_flow: outgoing,
            maximum_topoheight: max_topo,
        });
        this.table.body_element.replaceChildren();

        if (history.length === 0) {
            this.table.set_empty(localization.get_text(`No history. Check whether any filtering options are applied.`));
        }

        history.sort((a, b) => a.block_timestamp - b.block_timestamp);
        history.forEach((item) => {
            const history_row = new HistoryRow();
            history_row.set(item);
            this.history_rows.push(history_row);

            this.table.prepend_row(history_row.element);
        });

        this.pager_max_topo = history[history.length - 1].topoheight;
        this.pager_min_topo = history[0].topoheight;
        this.render_pager();
    }
}