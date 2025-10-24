import './settings_item.css';

export class SettingsItem {
    element: HTMLElement;
    title_element: HTMLElement;
    description_element: HTMLElement;
    input_element: HTMLElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-settings-item`);

        const left_content = document.createElement(`div`);
        this.element.appendChild(left_content);
        const right_content = document.createElement(`div`);
        this.element.appendChild(right_content);

        this.title_element = document.createElement(`div`);
        left_content.appendChild(this.title_element);

        this.description_element = document.createElement(`div`);
        left_content.appendChild(this.description_element);

        this.input_element = document.createElement(`div`);
        right_content.appendChild(this.input_element);
    }
}