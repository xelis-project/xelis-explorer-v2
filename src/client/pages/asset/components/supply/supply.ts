import { AssetWithData, GetAssetSupplyResult } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';
import { format_asset } from '../../../../utils/format_asset';

import './supply.css';
import { Box } from '../../../../components/box/box';

export class AssetSupply {
	container: Container;

	title_element: HTMLDivElement;
	content_element: HTMLDivElement;
	amount_box: Box;
	progress_bar_element: HTMLDivElement;

	constructor() {
		this.container = new Container();
		this.container.element.classList.add(`xe-asset-supply`);

		this.title_element = document.createElement(`div`);
		this.title_element.innerHTML = localization.get_text(`SUPPLY`);
		this.container.element.appendChild(this.title_element);

		this.content_element = document.createElement(`div`);
		this.container.element.appendChild(this.content_element);

		this.amount_box = new Box();
		this.amount_box.element.classList.add(`xe-asset-max-supply-item`);
		this.content_element.appendChild(this.amount_box.element);

		this.progress_bar_element = document.createElement(`div`);
		this.progress_bar_element.classList.add(`xe-supply-progress-bar`);
		this.content_element.appendChild(this.progress_bar_element);
	}

	set_loading(loading: boolean) {
		this.amount_box.set_loading(loading);
		this.progress_bar_element.remove();
	}

	set(asset_data: AssetWithData, supply: GetAssetSupplyResult) {
		const max_supply = asset_data.max_supply;

		let max_supply_atomic_amount;
		if (max_supply === `none`) {
			// do nothing
		} else if ("fixed" in max_supply) {
			max_supply_atomic_amount = max_supply.fixed;
		} else if ("mintable" in max_supply) {
			max_supply_atomic_amount = max_supply.mintable;
		}

		let supply_atomic_amount = supply.data;
		const supply_amount_string = format_asset(supply_atomic_amount, asset_data.decimals, asset_data.ticker);
		this.amount_box.element.innerHTML = `
			<div>${localization.get_text(`AMOUNT`)}</div>
			<div>${supply_amount_string}</div>
		`;

		if (max_supply_atomic_amount && supply_atomic_amount > 0) {
			const supply_percentage = supply_atomic_amount * 100 / max_supply_atomic_amount;
			this.content_element.appendChild(this.progress_bar_element);

			const supply_percentage_string = `${supply_percentage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
			this.progress_bar_element.innerHTML = `
				<div style="width:${Math.round(supply_percentage)}%">
					<div>${supply_percentage_string}</div>
				</div>
			`;
		}
	}
}