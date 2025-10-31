import { Container } from '../../../../components/container/container';
import humanNumber from 'human-number';
import { parse_atomic } from '../../../../utils/parse_atomic';
import { XELIS_DECIMALS } from '@xelis/sdk/config';
import { format_xel } from '../../../../utils/format_xel';
import { Box } from '../../../../components/box/box';
import { StatsItem } from './stats_item';
import { format_diff } from '../../../../utils/format_diff';
import { format_hashrate } from '../../../../utils/format_hashrate';
import prettyMilliseconds from 'pretty-ms';
import { DiskSize, GetInfoResult, P2PStatusResult } from '@xelis/sdk/daemon/types';
import prettyBytes from 'pretty-bytes';
import { localization } from '../../../../localization/localization';

import './top_stats.css';

export interface DashboardTopStatsData {
    info: GetInfoResult;
    size: DiskSize;
    p2p_status: P2PStatusResult;
}

export class DashboardTopStats {
    element: HTMLDivElement;
    container: Container

    last_update_element: HTMLDivElement;

    box_1: Box;
    item_max_supply: StatsItem;
    item_circ_supply: StatsItem;
    item_mined: StatsItem;
    item_block_reward: StatsItem;
    item_daily_emission: StatsItem;

    box_2: Box;
    item_topo: StatsItem;
    item_height: StatsItem;
    //item_stable: StatsItem;

    box_3: Box;
    item_diff: StatsItem;
    item_hashrate: StatsItem;
    item_avg_time: StatsItem;

    box_4: Box;
    item_mempool: StatsItem;
    item_peers: StatsItem;
    item_db_size: StatsItem;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-dashboard-top-stats`);

        this.last_update_element = document.createElement(`div`);
        this.last_update_element.classList.add(`xe-dashboard-top-stats-last-update`);
        this.element.appendChild(this.last_update_element);

        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-top-stats-container`, `scrollbar-1`, `scrollbar-1-bottom`);
        this.element.appendChild(this.container.element);

        this.box_1 = new Box();
        this.container.element.appendChild(this.box_1.element);

        this.item_max_supply = new StatsItem(localization.get_text(`MAX SUPPLY`));
        this.box_1.element.appendChild(this.item_max_supply.element);
        this.item_circ_supply = new StatsItem(localization.get_text(`CIRC SUPPLY`));
        this.box_1.element.appendChild(this.item_circ_supply.element);
        this.item_mined = new StatsItem(localization.get_text(`MINED`));
        this.box_1.element.appendChild(this.item_mined.element);
        this.item_block_reward = new StatsItem(localization.get_text(`BLOCK REWARD`));
        this.box_1.element.appendChild(this.item_block_reward.element);
        this.item_daily_emission = new StatsItem(localization.get_text(`DAILY EMISSION`));
        this.box_1.element.appendChild(this.item_daily_emission.element);

        this.box_2 = new Box();
        this.container.element.appendChild(this.box_2.element);

        this.item_topo = new StatsItem(localization.get_text(`TOPO`));
        this.box_2.element.appendChild(this.item_topo.element);
        this.item_height = new StatsItem(localization.get_text(`HEIGHT`));
        this.box_2.element.appendChild(this.item_height.element);
        //this.item_stable = new StatsItem(`STABLE`);
        //this.box_2.element.appendChild(this.item_stable.element);

        this.box_3 = new Box();
        this.container.element.appendChild(this.box_3.element);

        this.item_diff = new StatsItem(localization.get_text(`DIFF`));
        this.box_3.element.appendChild(this.item_diff.element);
        this.item_hashrate = new StatsItem(localization.get_text(`HASHRATE`));
        this.box_3.element.appendChild(this.item_hashrate.element);
        this.item_avg_time = new StatsItem(localization.get_text(`BLOCK TIME`));
        this.box_3.element.appendChild(this.item_avg_time.element);

        this.box_4 = new Box();
        this.container.element.appendChild(this.box_4.element);

        this.item_mempool = new StatsItem(localization.get_text(`MPOOL`));
        this.box_4.element.appendChild(this.item_mempool.element);
        this.item_peers = new StatsItem(localization.get_text(`PEERS`));
        this.box_4.element.appendChild(this.item_peers.element);
        this.item_db_size = new StatsItem(localization.get_text(`DB SIZE`));
        this.box_4.element.appendChild(this.item_db_size.element);
    }

    set_max_supply(max_supply: number) {
        const value = parse_atomic(max_supply, XELIS_DECIMALS);
        this.item_max_supply.element_value.innerHTML = `${humanNumber(value, x => x.toFixed(1))}`;
    }

    set_circ_supply(circ_supply: number) {
        const value = parse_atomic(circ_supply, XELIS_DECIMALS);
        this.item_circ_supply.element_value.innerHTML = `${humanNumber(value, x => x.toFixed(2))}`;
    }

    set_mined(circ_supply: number, max_supply: number) {
        const mined_percentage = circ_supply * 100 / max_supply;
        this.item_mined.element_value.innerHTML = `${mined_percentage.toFixed(2)}%`;
    }

    set_daily_emission(block_reward: number, block_time_target: number) {
        const day_in_seconds = 84600;
        const approx_blocks = day_in_seconds / (block_time_target / 1000);
        const approx_reward = approx_blocks * block_reward /// Math.pow(10, 8);
        this.item_daily_emission.element_value.innerHTML = `~${format_xel(approx_reward, true, undefined, { maximumFractionDigits: 0 })}`;
    }

    set_block_reward(block_reward: number) {
        this.item_block_reward.element_value.innerHTML = format_xel(block_reward, true, undefined);
    }

    set_topoheight(topoheight: number) {
        this.item_topo.element_value.innerHTML = `${topoheight.toLocaleString()}`;
    }

    set_height(height: number) {
        this.item_height.element_value.innerHTML = `${height.toLocaleString()}`;
    }

    //set_stableheight(stableheight: number) {
    //this.item_stable.element_value.innerHTML = `${stableheight.toLocaleString()}`;
    //}

    set_diff(difficulty: number) {
        this.item_diff.element_value.innerHTML = `${format_diff(difficulty)}`;
    }

    set_hashrate(difficulty: number, block_time_target: number) {
        this.item_hashrate.element_value.innerHTML = `${format_hashrate(difficulty, block_time_target)}`;
    }

    set_avg_time(avg_time: number) {
        this.item_avg_time.element_value.innerHTML = `${prettyMilliseconds(avg_time)}`;
    }

    set_mempool(tx_count: number) {
        this.item_mempool.element_value.innerHTML = `${tx_count.toLocaleString()}`;
    }

    set_peer_count(peer_count: number) {
        this.item_peers.element_value.innerHTML = `${peer_count.toLocaleString()}`;
    }

    set_db_size(size_in_bytes: number) {
        this.item_db_size.element_value.innerHTML = `${prettyBytes(size_in_bytes)}`;
    }

    set_info(info: GetInfoResult) {
        this.set_max_supply(info.maximum_supply);
        this.set_circ_supply(info.circulating_supply);
        this.set_mined(info.circulating_supply, info.maximum_supply);
        this.set_block_reward(info.block_reward);
        this.set_daily_emission(info.block_reward, info.block_time_target);

        this.set_topoheight(info.topoheight);
        this.set_height(info.height);
        //this.set_stableheight(info.stableheight);

        this.set_diff(parseInt(info.difficulty));
        this.set_hashrate(parseInt(info.difficulty), info.block_time_target);
        this.set_avg_time(info.average_block_time);

        this.set_mempool(info.mempool_size);
    }

    last_update_interval_id: any;
    last_update_timestamp: any;
    set_last_update() {
        this.last_update_timestamp = Date.now();

        const set_timer = () => {
            this.last_update_element.innerHTML = `${prettyMilliseconds(Date.now() - this.last_update_timestamp, { compact: true })}`;
        }

        set_timer();
        if (this.last_update_interval_id) window.clearInterval(this.last_update_interval_id);
        this.last_update_interval_id = window.setInterval(set_timer, 1000);
    }

    async load(data: DashboardTopStatsData) {
        this.set_last_update();
        this.set_info(data.info);
        this.set_db_size(data.size.size_bytes);
        this.set_peer_count(data.p2p_status.peer_count);
    }
}
