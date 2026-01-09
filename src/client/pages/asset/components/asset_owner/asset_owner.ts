import { AssetWithData } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import { localization } from '../../../../localization/localization';
import { format_hash } from '../../../../utils/format_hash';
import { Box } from '../../../../components/box/box';

import './asset_owner.css';

export class AssetOwner {
	container: Container;

	title_element: HTMLDivElement;
	content_box: Box;

	constructor() {
		this.container = new Container();
		this.container.element.classList.add(`xe-asset-owner`);

		this.title_element = document.createElement(`div`);
		this.title_element.innerHTML = localization.get_text(`OWNER`);
		this.container.element.appendChild(this.title_element);

		this.content_box = new Box();
		this.container.element.appendChild(this.content_box.element);
	}

	set_loading(loading: boolean) {
		this.content_box.set_loading(loading);
	}

	set(asset_data: AssetWithData) {
		const item = (title: string, value: string) => {
			return `
				<div class="xe-asset-owner-item">
					<div>${title}</div>
					<div>${value}</div>
				</div>
			`;
		}

		const owner = asset_data.owner;
		if (owner === `none`) {
			this.content_box.element.innerHTML = `
				<div class="xe-asset-owner-msg">
					${localization.get_text(`The creator link has been deleted or it's the native asset.`)}
				</div>
			`;
		} else if ("creator" in owner) {
			const { contract, id } = owner.creator;
			this.content_box.element.innerHTML = `
				${item(`CONTRACT HASH`, `<a href="/contract/${contract}">${format_hash(contract)}</a>`)}
				${item(`ID`, id.toString())}
				<div class="xe-asset-owner-msg">
					${localization.get_text(`The original owner of the asset.`)}
				</div>
			`;
		} else if ("owner" in owner) {
			const { owner: owner_hash, origin, origin_id } = owner.owner;
			this.content_box.element.innerHTML = `
				${item(`OWNER HASH`, `<a href="/contract/${owner_hash}">${format_hash(owner_hash)}</a>`)}
				${item(`ORIGIN`, origin)}
				${item(`ORIGIN ID`, origin_id.toString())}
				<div class="xe-asset-owner-msg">
					${localization.get_text(`The ownership has changed.`)}
				</div>
			`;
		}
	}
}