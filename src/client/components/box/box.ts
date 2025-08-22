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
}