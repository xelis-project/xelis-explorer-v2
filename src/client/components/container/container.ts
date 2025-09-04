import { Box } from '../box/box';
import './container.css';

export class Container {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-container`);
    }

    box_loading(loading: boolean) {
        const boxes = this.element.querySelectorAll(`.xe-box`);
        boxes.forEach(box => {
            if (loading) {
                box.classList.add(`xe-box-loading`);
            } else {
                box.classList.remove(`xe-box-loading`);
            }
        });
    }

    list_loading(count: number, min_height: string) {
        this.element.replaceChildren();
        for (let i = 0; i < count; i++) {
            const box = new Box();
            box.set_loading(true);
            box.element.style.minHeight = min_height;
            this.element.appendChild(box.element);
        }
    }
}
