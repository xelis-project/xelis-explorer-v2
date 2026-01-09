import { AssetWithData } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';
import { XelisNode } from '../../../../app/xelis_node';
import { format_asset } from '../../../../utils/format_asset';

import './max_supply.css';

export class AssetMaxSupply {
	container: Container;

	title_element: HTMLDivElement;
	content_element: HTMLDivElement;

	constructor() {
		this.container = new Container();
		this.container.element.classList.add(`xe-asset-max-supply`);

		this.title_element = document.createElement(`div`);
		this.title_element.innerHTML = localization.get_text(`MAX SUPPLY`);
		this.container.element.appendChild(this.title_element);


		this.content_element = document.createElement(`div`);
		this.container.element.appendChild(this.content_element);
	}

	set(asset_data: AssetWithData) {
		const max_supply = asset_data.max_supply;

		const item = (title: string, value: string) => {
			return `
				<div class="xe-asset-max-supply-item">
					<div>${title}</div>
					<div>${value}</div>
				</div>
			`;
		}

		if (max_supply === `none`) {
			this.content_element.innerHTML = `
				${item(`AMOUNT`, `--`)}
				${item(`TYPE`, localization.get_text(`NONE`))}
				<div class="xe-asset-max-supply-msg">${localization.get_text(`No max supply was set.`)}</div>
			`;
		} else if ("fixed" in max_supply) {
			const amount_string = format_asset(max_supply.fixed, asset_data.decimals, asset_data.ticker);

			this.content_element.innerHTML = `
				${item(`AMOUNT`, amount_string)}
				${item(`TYPE`, localization.get_text(`FIXED`))}
				<div class="xe-asset-max-supply-msg">
					${localization.get_text(`The supply is fixed, emitted one time and managed by the contract.`)}
				</div>
			`;
		} else if ("mintable" in max_supply) {
			const amount_string = format_asset(max_supply.mintable, asset_data.decimals, asset_data.ticker);

			this.content_element.innerHTML = `
				${item(`AMOUNT`, amount_string)}
				${item(`TYPE`, localization.get_text(`MINTABLE`))}
				<div class="xe-asset-max-supply-msg">
					${localization.get_text(`For as long as the circulating supply is below the max supply, mint is possible.`)}
				</div>
			`;
		}
	}
}