import { Page } from "../page";
import { Master } from "../../components/master/master";
import { localization } from "../../localization/localization";
import { ServerApp } from "../../../server";
import { Context } from "hono";

import './network_upgrades.css';
import { XelisNode } from "../../app/xelis_node";
import { Container } from "../../components/container/container";
import { Table } from "../../components/table/table";
import { UpgradeRow } from "./upgrade_row/upgrade_row";

export class NetworkUpgradesPage extends Page {
	static pathname = "/network-upgrades"

	static async handle_server(c: Context<ServerApp>) {
		this.title = localization.get_text(`Network Upgrades`);
		this.description = localization.get_text(``);
	}

	master: Master;
	table: Table;

	constructor() {
		super();

		this.master = new Master();
		this.master.content.classList.add(`xe-network-upgrades`);
		this.element.appendChild(this.master.element);

		const container = new Container();
		this.master.content.appendChild(container.element);

		this.table = new Table();
		container.element.appendChild(this.table.element);

		const titles = [
			localization.get_text(`UPGRADE CHANGELOG`),
			localization.get_text(`ONLINE HEIGHT`),
			localization.get_text(`UPGRADE VERSION`),
			localization.get_text(`NODE REQUIREMENT`),
			localization.get_text(`ONLINE DATE`),
		];
		this.table.set_head_row(titles);
	}

	async load(parent: HTMLElement) {
		super.load(parent);
		this.set_window_title(localization.get_text(`Network Upgrades`));

		this.table.body_element.replaceChildren();
		this.table.set_loading(5);

		const node = XelisNode.instance();
		const hard_forks = await node.rpc.getHardForks();
		this.table.body_element.replaceChildren();

		hard_forks.forEach(hard_fork => {
			const upgrade_row = new UpgradeRow();
			upgrade_row.set(hard_fork);
			this.table.prepend_row(upgrade_row.element);
		});
	}
}