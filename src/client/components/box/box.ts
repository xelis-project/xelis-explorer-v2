import './box.css';

export class Box {
    element: HTMLDivElement | HTMLAnchorElement;

    constructor(href?: string) {
        if (href) {
            this.element = document.createElement(`a`);
            this.element.href = href;
        } else {
            this.element = document.createElement(`div`);
        }

        this.element.classList.add(`xe-box`);
    }

    set_loading(loading: boolean) {
        Box.set_loading(this.element, loading);
    }

    static set_loading(element: HTMLElement, loading: boolean) {
        if (loading) {
            // element.style.animationDelay = `${Math.random()*0.1}s`;
            element.classList.add(`xe-box-loading`);
        } else {
            element.classList.remove(`xe-box-loading`);
        }
    }

    static content_loading(element: HTMLElement, loading: boolean, min_height?: string) {
        if (loading) {
            if (min_height) element.style.minHeight = min_height;
            element.classList.add(`xe-box`);
        }

        Box.set_loading(element, loading);
    }

    static boxes_loading(element: HTMLElement, loading: boolean) {
        const boxes = element.querySelectorAll<HTMLElement>(`.xe-box`);
        boxes.forEach(box => Box.set_loading(box, loading));
    }

    static list_loading(element: HTMLElement, count: number, min_height: string) {
        element.replaceChildren();
        for (let i = 0; i < count; i++) {
            const box = new Box();
            box.set_loading(true);
            box.element.style.minHeight = min_height;
            element.appendChild(box.element);
        }
    }
}