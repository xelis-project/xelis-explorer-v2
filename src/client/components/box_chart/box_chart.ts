import { Box } from "../box/box";

import './box_chart.css';

export class BoxChart {
    box: Box;
    element_title: HTMLDivElement;
    element_value: HTMLDivElement;
    element_sub_value: HTMLDivElement;
    element_content: HTMLDivElement;

    constructor() {
        this.box = new Box();
        this.box.element.classList.add(`xe-box-chart`);

        this.element_title = document.createElement(`div`);
        this.element_title.classList.add(`xe-box-chart-title`);
        this.box.element.appendChild(this.element_title);

        const container = document.createElement(`div`);
        this.box.element.appendChild(container);

        this.element_value = document.createElement(`div`);
        this.element_value.classList.add(`xe-box-chart-value`);
        container.appendChild(this.element_value);

        this.element_sub_value = document.createElement(`div`);
        this.element_sub_value.classList.add(`xe-box-chart-sub-value`);
        container.appendChild(this.element_sub_value);

        this.element_content = document.createElement(`div`);
        this.element_content.classList.add(`xe-box-chart-content`);
        this.box.element.appendChild(this.element_content);
    }
}