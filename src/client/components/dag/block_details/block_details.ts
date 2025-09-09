import { Block } from '@xelis/sdk/daemon/types';
import { format_xel } from '../../../utils/format_xel';
import prettyBytes from 'pretty-bytes';
import { format_hashrate } from '../../../utils/format_hashrate';
import { format_diff } from '../../../utils/format_diff';

import './block_details.css';

export class DAGBlockDetails {
    element: HTMLDivElement;

    element_hash: HTMLDivElement;
    element_block_type: HTMLDivElement;
    element_timestamp: HTMLDivElement;
    element_confirmations: HTMLDivElement;
    element_topoheight: HTMLDivElement;
    element_height: HTMLDivElement;
    element_miner: HTMLDivElement;
    element_fees: HTMLDivElement;
    element_reward: HTMLDivElement;
    element_supply: HTMLDivElement;
    element_tx_count: HTMLDivElement;
    element_diff: HTMLDivElement;
    element_hashrate: HTMLDivElement;
    element_size: HTMLDivElement;
    element_nonce: HTMLDivElement;
    element_tips: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-dag-block-details`, `scrollbar-1`, `scrollbar-1-right`);

        this.element_hash = document.createElement(`div`);
        this.element.appendChild(this.element_hash);

        this.element_block_type = document.createElement(`div`);
        this.element.appendChild(this.element_block_type);

        this.element_timestamp = document.createElement(`div`);
        this.element.appendChild(this.element_timestamp);

        this.element_confirmations = document.createElement(`div`);
        this.element.appendChild(this.element_confirmations);

        this.element_topoheight = document.createElement(`div`);
        this.element.appendChild(this.element_topoheight);

        this.element_height = document.createElement(`div`);
        this.element.appendChild(this.element_height);

        this.element_miner = document.createElement(`div`);
        this.element.appendChild(this.element_miner);

        this.element_fees = document.createElement(`div`);
        this.element.appendChild(this.element_fees);

        this.element_reward = document.createElement(`div`);
        this.element.appendChild(this.element_reward);

        this.element_supply = document.createElement(`div`);
        this.element.appendChild(this.element_supply);

        this.element_tx_count = document.createElement(`div`);
        this.element.appendChild(this.element_tx_count);

        this.element_diff = document.createElement(`div`);
        this.element.appendChild(this.element_diff);

        this.element_hashrate = document.createElement(`div`);
        this.element.appendChild(this.element_hashrate);

        this.element_size = document.createElement(`div`);
        this.element.appendChild(this.element_size);

        this.element_nonce = document.createElement(`div`);
        this.element.appendChild(this.element_nonce);

        this.element_tips = document.createElement(`div`);
        this.element.appendChild(this.element_tips);

        this.element.addEventListener(`click`, (e) => {
            e.stopImmediatePropagation();
        });
    }

    show() {
        this.element.style.display = `block`;
    }

    hide() {
        this.element.style.display = `none`;
    }

    set_position(x: number, y: number) {
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    set(block: Block) {
        this.set_hash(block.hash);
        this.set_block_type(block.block_type);

        this.set_topoheight(block.topoheight);
        this.set_height(block.height);
        this.set_fees(block.total_fees);
        this.set_reward(block.reward);
        this.set_tx_count(block.txs_hashes.length);
        this.set_supply(block.supply);
        this.set_size(block.total_size_in_bytes);
        this.set_nonce(block.nonce);
        this.set_hashrate(parseInt(block.difficulty), 15000);
    }

    set_item(element: HTMLDivElement, title: string, value: string) {
        element.innerHTML = `
            <div>${title}</div>
            <div>${value}</div>
        `;
    }

    set_hash(hash: string) {
        this.set_item(this.element_hash, `HASH`, hash);
    }

    set_block_type(block_type: string) {
        this.set_item(this.element_block_type, `TYPE`, block_type);
    }

    set_timestamp() {

    }

    set_confirmations() {

    }

    set_topoheight(topoheight?: number) {
        this.set_item(this.element_topoheight, `TOPOHEIGHT`, topoheight ? topoheight.toLocaleString() : `--`);
    }

    set_height(height: number) {
        this.set_item(this.element_height, `HEIGHT`, height.toLocaleString());
    }

    set_miner() {

    }

    set_fees(fees?: number) {
        this.set_item(this.element_fees, `FEES`, fees ? format_xel(fees, true) : `--`);
    }

    set_reward(reward?: number) {
        this.set_item(this.element_reward, `REWARD`, reward ? format_xel(reward, true) : `--`);
    }

    set_supply(supply?: number) {
        this.set_item(this.element_supply, `SUPPLY`, supply ? format_xel(supply, true) : `--`);
    }

    set_tx_count(tx_count: number) {
        this.set_item(this.element_tx_count, `TXS`, tx_count.toLocaleString());
    }

    set_diff(difficulty: number) {
        this.set_item(this.element_diff, `DIFF`, format_diff(difficulty));
    }

    set_hashrate(difficulty: number, block_time_target: number) {
        this.set_item(this.element_hashrate, `HASHRATE`, format_hashrate(difficulty, block_time_target));
    }

    set_size(size_in_bytes: number) {
        this.set_item(this.element_size, `SIZE`, prettyBytes(size_in_bytes));
    }

    set_nonce(nonce: string) {
        this.set_item(this.element_size, `NONCE`, nonce);
    }

    set_extra_nonce() {

    }

    set_tips() {

    }
}