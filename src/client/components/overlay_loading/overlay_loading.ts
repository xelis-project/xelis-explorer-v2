import './overlay_loading.css';

export class OverlayLoading {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
    }

    set_loading(loading: boolean) {
        if (loading) {
            const loading_element = document.createElement(`div`);
            loading_element.classList.add(`xe-overlay-loading`);
            loading_element.innerHTML = `
                    <div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
            this.element.appendChild(loading_element);
        } else {
            this.element.replaceChildren();
        }
    }
}