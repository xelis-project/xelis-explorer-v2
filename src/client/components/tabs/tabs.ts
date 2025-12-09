import './tabs.css';

export class Tabs {
    element: HTMLDivElement;
    bar_element: HTMLDivElement;
    content_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-tabs`);

        this.bar_element = document.createElement(`div`);
        this.bar_element.classList.add(`xe-tabs-bar`);
        this.element.appendChild(this.bar_element);

        this.content_element = document.createElement(`div`);
        this.content_element.classList.add(`xe-tabs-content`);
        this.element.appendChild(this.content_element);
    }

    add(title_html: string, content_element: HTMLElement) {
        const bar_item = document.createElement(`button`);
        bar_item.innerHTML = title_html;
        bar_item.addEventListener(`click`, () => {
            this.content_element.replaceChildren();
            this.content_element.appendChild(content_element);
        });

        this.bar_element.appendChild(bar_item);
    }
}