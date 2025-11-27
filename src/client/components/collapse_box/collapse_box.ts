import icons from '../../assets/svg/icons';

import './collapse_box.css';

export class CollapseBox {
    element: HTMLDivElement;
    title_element: HTMLDivElement;
    content_element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-collapse-box`);

        const title_wrap = document.createElement(`div`);
        this.element.appendChild(title_wrap);

        this.title_element = document.createElement(`div`);
        title_wrap.appendChild(this.title_element);

        const arrow = document.createElement(`div`);
        arrow.innerHTML = icons.caret_down();
        title_wrap.appendChild(arrow);

        title_wrap.addEventListener(`click`, () => {
            if (this.element.classList.contains(`collapsed`)) {
                this.set_collapse(false);
            } else {
                this.set_collapse(true);
            }
        });

        this.content_element = document.createElement(`div`);
        this.element.appendChild(this.content_element);
    }

    set_collapse(collapse: boolean) {
        if (collapse) {
            this.element.classList.add(`collapsed`);
        } else {
            this.element.classList.remove(`collapsed`);
        }
    }
}