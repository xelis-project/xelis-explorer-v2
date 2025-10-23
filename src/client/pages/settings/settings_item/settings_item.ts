import './settings_item.css';

export class SettingsItem {
    element: HTMLElement;
    input_element: HTMLElement;

    constructor(title: string, description: string) {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-settings-item`);

        const left_content = document.createElement(`div`);
        this.element.appendChild(left_content);
        const right_content = document.createElement(`div`);
        this.element.appendChild(right_content);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = title;
        left_content.appendChild(title_element);

        const description_element = document.createElement(`div`);
        description_element.innerHTML = description;
        left_content.appendChild(description_element);

        this.input_element = document.createElement(`div`);
        right_content.appendChild(this.input_element);
    }
}