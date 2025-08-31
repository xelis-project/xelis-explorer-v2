import { BlockType } from "@xelis/sdk/daemon/types";

import './block_type_box.css';

export class BlockTypeBox {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add();
    }

    set(size: number, block_type: BlockType) {
        this.element.style.width = `${size}rem`;
        this.element.style.height = `${size}rem`;
        this.element.style.borderRadius = `${size/5}rem`;
        this.element.className = ``;
        this.element.classList.add(`xe-block-type-box`, `xe-block-type-box-${block_type.toLowerCase()}`);
    }

    static test() {
        const div = document.createElement(`div`);
        const block_size = 2;

        const box_1 = new BlockTypeBox();
        box_1.set(block_size, BlockType.Normal);
        div.appendChild(box_1.element);

        const box_2 = new BlockTypeBox();
        box_2.set(block_size, BlockType.Side);
        div.appendChild(box_2.element);

        const box_3 = new BlockTypeBox();
        box_3.set(block_size, BlockType.Orphaned);
        div.appendChild(box_3.element);

        const box_4 = new BlockTypeBox();
        box_4.set(block_size, BlockType.Sync);
        div.appendChild(box_4.element);

        return div;
    }
}