import { GetInfoResult } from '@xelis/sdk/daemon/types';
import icons from '../../../../assets/svg/icons';
import './next_block_btns.css';

export class BlockNextBlockBtns {
    element: HTMLDivElement;
    previous_block: HTMLAnchorElement;
    next_block: HTMLAnchorElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-block-next-block-btns`);

        this.previous_block = document.createElement(`a`);
        this.element.appendChild(this.previous_block);

        this.next_block = document.createElement(`a`);
        this.element.appendChild(this.next_block);
    }

    set(info: GetInfoResult, topoheight?: number) {
        if (topoheight) {
            this.element.style.removeProperty(`display`);
            const previous_topo = Math.max(0, topoheight - 1);
            this.previous_block.innerHTML = `${icons.caret_down()} Previous (${previous_topo.toLocaleString()})`;
            this.previous_block.href = `/topo/${previous_topo}`;

            const next_topo = topoheight + 1;
            if (info.topoheight >= next_topo) {
                this.next_block.style.removeProperty(`display`);
                this.next_block.innerHTML = `Next (${next_topo.toLocaleString()}) ${icons.caret_down()}`;
                this.next_block.href = `/topo/${next_topo}`;
            } else {
                this.next_block.style.display = `none`;
            }
        } else {
            this.element.style.display = `none`;
        }
    }
}