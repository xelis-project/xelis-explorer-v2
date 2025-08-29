import { Container } from "../../../../components/container/container";
import { TextInput } from "../../../../components/text_input/text_input";

import './search.css';

export class PeersSearch {
    container: Container;
    text_input: TextInput;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-peers-search`);

        const form = document.createElement(`form`);
        this.container.element.appendChild(form);

        this.text_input = new TextInput();
        this.text_input.element.name = `peers_search_input`;
        this.text_input.element.placeholder = `Search ip, country, or tag`;
        form.appendChild(this.text_input.element);

        form.addEventListener(`submit`, (e) => {
            e.preventDefault();
            this.search();
        });
    }

    async search() {
        
    }
}