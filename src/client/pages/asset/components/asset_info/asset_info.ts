import { AssetWithData, Block } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';

import './asset_info.css';
import prettyMilliseconds from 'pretty-ms';

export class AssetInfo {
	container: Container;

	title_element: HTMLDivElement;
	content_element: HTMLDivElement;

	constructor() {
		this.container = new Container();
		this.container.element.classList.add(`xe-asset-info`);

		this.title_element = document.createElement(`div`);
		this.title_element.innerHTML = localization.get_text(`ASSET INFO`);
		this.container.element.appendChild(this.title_element);

		this.content_element = document.createElement(`div`);
		this.container.element.appendChild(this.content_element);
	}

	set(asset_data: AssetWithData, block: Block) {
		const item = (title: string, value: string) => {
			return `
				<div class="xe-asset-info-item">
					<div>${title}</div>
					<div>${value}</div>
				</div>
			`;
		}

		this.content_element.innerHTML = `
			${item(`HASH`, asset_data.asset)}
			${item(`NAME`, asset_data.name)}
			${item(`TICKER`, asset_data.ticker)}
			${item(`TOPOHEIGHT`, `<a href="/topo/${asset_data.topoheight}">${asset_data.topoheight.toLocaleString()}</a>`)}
			${item(`DECIMALS`, asset_data.decimals.toLocaleString())}
			${item(`DEPLOYED`, new Date(block.timestamp).toLocaleString())}
		`;
	}
}