import './stats_item.css';

export class StatsItem {
    element: HTMLDivElement;
    element_title: HTMLDivElement;
    element_value: HTMLDivElement;

    constructor(title: string) {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-dashboard-top-stats-item`);

        this.element_title = document.createElement(`div`);
        this.element_title.innerHTML = title;
        this.element.appendChild(this.element_title);

        this.element_value = document.createElement(`div`);
        this.element_value.innerHTML = `\u200c`;
        this.element.appendChild(this.element_value);
    }
}