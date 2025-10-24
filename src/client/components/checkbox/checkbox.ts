import './checkbox.css';

export class Checkbox {
    element: HTMLDivElement;
    text_element: HTMLDivElement;
    input_element: HTMLInputElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-checkbox`);

        this.text_element = document.createElement(`div`);
        this.element.appendChild(this.text_element);

        const container = document.createElement(`div`);
        container.classList.add(`xe-checkbox-container`);

        this.input_element = document.createElement(`input`);
        this.input_element.type = `checkbox`;
        container.appendChild(this.input_element);

        const checkmark = document.createElement(`div`);
        checkmark.classList.add(`xe-checkbox-checkmark`);
        container.appendChild(checkmark);

        this.element.appendChild(container);
    }
}
