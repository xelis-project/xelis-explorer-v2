import { GetContractBalanceResult } from '@xelis/sdk/daemon/types';
import { XelisNode } from '../../../../app/xelis_node';
import { Container } from '../../../../components/container/container';
import { fetch_contract_balances } from '../../../../fetch_helpers/fetch_contract_balances';
import { format_hash } from '../../../../utils/format_hash';
import { format_asset } from '../../../../utils/format_asset';
import { Box } from '../../../../components/box/box';
import { localization } from '../../../../localization/localization';

import './assets.css';

export class ContractAssets {
    container: Container;
    list_element: HTMLElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-contract-assets`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`BALANCES`);
        this.container.element.appendChild(title_element);

        this.list_element = document.createElement(`div`);
        this.list_element.classList.add(`xe-contract-assets-list`);
        this.container.element.appendChild(this.list_element);
    }

    add_item(asset: string, balance: GetContractBalanceResult) {
        const box = new Box();

        const asset_element = document.createElement(`div`);
        box.element.appendChild(asset_element);
        asset_element.innerHTML = format_hash(asset);

        const topo_element = document.createElement(`div`);
        box.element.appendChild(topo_element);
        topo_element.innerHTML = `${balance.topoheight.toLocaleString()} (${balance.previous_topoheight ? balance.previous_topoheight.toLocaleString() : `--`})`;

        const balance_element = document.createElement(`div`);
        box.element.appendChild(balance_element);
        balance_element.innerHTML = format_asset(asset, balance.data, true);

        this.list_element.appendChild(box.element);
    }

    async load(contract_hash: string) {
        this.list_element.replaceChildren();
        Box.list_loading(this.list_element, 10, `3rem`);

        const node = XelisNode.instance();

        const assets = await node.rpc.getContractAssets({
            contract: contract_hash
        });

        // todo 20 assets limit
        const balances = await fetch_contract_balances(contract_hash, assets);

        this.list_element.replaceChildren();

        balances.forEach((balance, i) => {
            const asset = assets[i];
            this.add_item(asset, balance);
        });
    }
}