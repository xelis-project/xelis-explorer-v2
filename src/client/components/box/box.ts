import './box.css';

export class Box {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-box`);
    }

    set_loading(loading: boolean) {
        if (loading) {
            this.element.classList.add(`xe-box-loading`);
        } else {
            this.element.classList.remove(`xe-box-loading`);
        }
    }

    static content_loading(element: HTMLElement, loading: boolean, min_height?: string) {
        if (loading) {
            if (min_height) element.style.minHeight = min_height;
            element.classList.add(`xe-box`, `xe-box-loading`);
        } else {
            element.classList.remove(`xe-box`, `xe-box-loading`);
        }
    }
}