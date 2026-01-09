import { AssetWithData, Block } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';

import './asset_info.css';
import { Box } from '../../../../components/box/box';

export class AssetInfo {
	container: Container;

	title_element: HTMLDivElement;
	content_element: HTMLDivElement;

	hash_box: Box;
	name_box: Box;
	ticker_box: Box;
	details_box: Box;

	constructor() {
		this.container = new Container();
		this.container.element.classList.add(`xe-asset-info`);

		this.title_element = document.createElement(`div`);
		this.title_element.innerHTML = localization.get_text(`ASSET INFO`);
		this.container.element.appendChild(this.title_element);

		this.content_element = document.createElement(`div`);
		this.container.element.appendChild(this.content_element);

		this.hash_box = new Box();
		this.hash_box.element.classList.add(`xe-asset-info-item`);
		this.content_element.appendChild(this.hash_box.element);

		this.name_box = new Box();
		this.name_box.element.classList.add(`xe-asset-info-item`);
		this.content_element.appendChild(this.name_box.element);

		this.ticker_box = new Box();
		this.ticker_box.element.classList.add(`xe-asset-info-item`);
		this.content_element.appendChild(this.ticker_box.element);

		this.details_box = new Box();
		this.details_box.element.classList.add(`xe-asset-info-details`);
		this.content_element.appendChild(this.details_box.element);
	}

	set_loading(loading: boolean) {
		this.hash_box.set_loading(loading);
		this.name_box.set_loading(loading);
		this.ticker_box.set_loading(loading);
		this.details_box.set_loading(loading);
	}

	set(asset_data: AssetWithData, block: Block) {
		this.hash_box.element.innerHTML = `
			<div>${localization.get_text(`HASH`)}</div>
			<div>${asset_data.asset}</div>
		`;

		this.name_box.element.innerHTML = `
			<div>${localization.get_text(`NAME`)}</div>
			<div>${asset_data.name}</div>
		`;

		this.ticker_box.element.innerHTML = `
			<div>${localization.get_text(`TICKER`)}</div>
			<div>${asset_data.ticker}</div>
		`;

		this.details_box.element.innerHTML = `
			<div class="xe-asset-info-item">
				<div>${localization.get_text(`DECIMALS`)}</div>
				<div>${asset_data.decimals.toLocaleString()}</div>
			</div>
			<div class="xe-asset-info-item">
				<div>${localization.get_text(`TOPOHEIGHT`)}</div>
				<div><a href="/topo/${asset_data.topoheight}">${asset_data.topoheight.toLocaleString()}</a></div>
			</div>
			<div class="xe-asset-info-item">
				<div>${localization.get_text(`DEPLOYED`)}</div>
				<div>${new Date(block.timestamp).toLocaleString()}</div>
			</div>
		`;
	}
}