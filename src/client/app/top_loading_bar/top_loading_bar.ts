import './top_loading_bar.css';

export class TopLoadingBar {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-top-loading-bar`);
    }

    start() {
        this.element.classList.add(`xe-top-loading-bar-animate`);
    }

    end() {
        this.element.classList.remove(`xe-top-loading-bar-animate`);
    }
}