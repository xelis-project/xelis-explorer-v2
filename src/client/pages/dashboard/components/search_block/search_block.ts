import { Container } from "../../../../components/container/container";
import { TextInput } from "../../../../components/text_input/text_input";

import './search_block.css';

export class DashboardSearchBlock {
    container: Container;
    text_input: TextInput;
    
    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-dashboard-search-block`);

        this.text_input = new TextInput();
        this.text_input.element.placeholder = `Search block, transaction or account address`;
        this.container.element.appendChild(this.text_input.element);

        this.text_input.element.addEventListener(`input`, (e) => {
            const value = this.text_input.element.value;
            console.log(value);
        });
    }
}