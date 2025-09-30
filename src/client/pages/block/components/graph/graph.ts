import { Block } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { DAG } from "../../../../components/dag/dag";
import { Box } from "../../../../components/box/box";

import './graph.css';

export class BlockGraph {
    container: Container;

    hash_element: HTMLDivElement;
    tips_element: HTMLDivElement;
    nonce_element: HTMLDivElement;
    extra_nonce_element: HTMLDivElement;

    dag: DAG;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-block-graph`);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);
        this.dag = new DAG();
        this.dag.element.classList.add(`xe-block-graph-dag`);
        container_1.appendChild(this.dag.element);

        const container_2 = document.createElement(`div`);
        container_2.classList.add(`xe-block-graph-container-2`);
        this.container.element.appendChild(container_2);

        this.hash_element = document.createElement(`div`);
        container_2.appendChild(this.hash_element);
        this.tips_element = document.createElement(`div`);
        container_2.appendChild(this.tips_element);
        this.nonce_element = document.createElement(`div`);
        container_2.appendChild(this.nonce_element);
        this.extra_nonce_element = document.createElement(`div`);
        container_2.appendChild(this.extra_nonce_element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.hash_element, loading);
        Box.content_loading(this.tips_element, loading);
        Box.content_loading(this.nonce_element, loading);
        Box.content_loading(this.extra_nonce_element, loading);
    }

    async set(block: Block) {
        this.set_hash(block.hash);
        this.set_tips(block.tips);
        this.set_nonce(block.nonce);
        this.set_extra_nonce(block.extra_nonce);
        await this.dag.load_blocks(block.height);
        this.dag.update_size();
    }

    set_hash(hash: string) {
        this.hash_element.innerHTML = `
            <div>HASH</div>
            <div>${hash}</div>
        `;
    }

    set_tips(tips: string[]) {
        this.tips_element.replaceChildren();

        const text = document.createElement(`div`);
        text.innerHTML = `TIPS`;
        this.tips_element.appendChild(text);

        const tips_container = document.createElement(`div`);
        this.tips_element.appendChild(tips_container);
        tips.forEach((tip, i) => {
            const tip_element = document.createElement(`div`);
            tip_element.innerHTML = `${i}: <a href="/block/${tip}">${tip}</a>`;
            tips_container.appendChild(tip_element);
        });
    }

    set_nonce(nonce: number) {
        this.nonce_element.innerHTML = `
            <div>NONCE</div>
            <div>${nonce}</div>
        `;
    }

    set_extra_nonce(extra_nonce: string) {
        this.extra_nonce_element.innerHTML = `
            <div>EXTRA NONCE</div>
            <div>${extra_nonce}</div>
        `;
    }
}