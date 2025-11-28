import { TransactionData } from '@xelis/sdk/daemon/types';
import { animate } from 'animejs';

import './tx_data_hover.css';

export class TxDataHover {
    element: HTMLDivElement;
    visible: boolean;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-tx-data-hover`);
        this.visible = false;

                  this.element.addEventListener(`mouseleave`, () => {
                    this.hide();
                  });
    }

    set_pos(x: number, y: number) {
        const max_x = window.innerWidth - this.element.clientWidth - 20;
        const max_y = window.innerHeight - this.element.clientHeight - 20;
        this.element.style.left = `${Math.min(max_x, x)}px`;
        this.element.style.top = `${Math.min(max_y, y)}px`;
    }

    show(data: TransactionData) {
        if (this.visible) return;
        this.visible = true;

        this.element.style.visibility = `visible`;
        animate(this.element, {
            opacity: [0, 1],
            translateX: [`-25%`, 0],
            duration: 250,
            onComplete: () => {

            }
        });

        /*let html = ``;
        Object.keys(data.invoke_contract).forEach((key) => {
            const value = JSON.stringify(data.invoke_contract[key]);
            html += `
                <div>
                    <div>${key}</div>
                    <div>${value}</div>
                </div>
            `;
        });*/

        //this.element.innerHTML = html;
    }

    hide() {
        if (!this.visible) return;
        this.visible = false;

        animate(this.element, {
            opacity: [1, 0],
            translateX: [0, `-25%`],
            duration: 250,
            onComplete: () => {
                this.element.style.visibility = `hidden`;
            }
        });
    }
}