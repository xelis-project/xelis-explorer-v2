import './overlay_loading.css';

export class OverlayLoading {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-overlay-loading`);
    }

    set_loading(loading: boolean) {
        if (loading) {
            const wrap = document.createElement(`div`);
            wrap.classList.add(`xe-overlay-loading-wrap`);

            const content = document.createElement(`div`);
            content.classList.add(`xe-overlay-loading-content`);
            wrap.appendChild(content);

            for (let i = 0; i < 3; i++) {
                const line = document.createElement(`div`);
                content.appendChild(line);
            }

            this.element.appendChild(wrap);
        } else {
            this.element.replaceChildren();
        }
    }
}