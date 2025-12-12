import { Block, HardFork } from "@xelis/sdk/daemon/types";
import { Row } from "../../../components/table/row";
import { XelisNode } from "../../../app/xelis_node";

import './upgrade_row.css';

export class UpgradeRow extends Row {
    constructor() {
        super(5);
    }

    set(hard_fork: HardFork, top_block: Block) {
        this.set_changelog(hard_fork.changelog);
        this.set_height(hard_fork.height);
        this.set_version(hard_fork.version);
        this.set_version_requirement(hard_fork.version_requirement);
        this.set_online_date(hard_fork.height, top_block);
    }

    set_changelog(changelog: string) {
        this.value_cells[0].innerHTML = changelog;
    }

    set_height(height: number) {
        this.value_cells[1].innerHTML = `${height.toLocaleString()}`;
    }

    set_version(version: number) {
        this.value_cells[2].innerHTML = `${version.toLocaleString()}`;
    }

    set_version_requirement(version_requirement: string | null) {
        this.value_cells[3].innerHTML = version_requirement ? version_requirement : `--`;
    }

    async set_online_date(height: number, top_block: Block) {
        const node = XelisNode.instance();
        const blocks = await node.ws.methods.getBlocksAtHeight({
            height: height,
            include_txs: false
        });

        if (blocks.length > 0) {
            const first_block = blocks[0];
            const date = new Date(first_block.timestamp);
            this.value_cells[4].innerHTML = date.toLocaleString();
        } else {
            // guess the date
            const expected_timestamp = Date.now() + ((height - top_block.height) * 15000);
            const date = new Date(expected_timestamp);
            this.value_cells[4].innerHTML = `~${date.toLocaleString()}`;
            this.value_cells[4].className = `xe-network-upgrade-guess`;
        }
    }
}