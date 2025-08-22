import './text_input.css';

export class TextInput {
    element: HTMLInputElement;

    constructor() {
        this.element = document.createElement(`input`);
        this.element.classList.add(`xe-text-input`);
        this.element.type = "text";
    }
}