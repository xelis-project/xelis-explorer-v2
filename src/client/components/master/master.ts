import { Background } from "../background/background";
import { Header } from "../header/header";

import './master.css';

export class Master {
    element: HTMLDivElement;
    background: Background;
    header: Header;
    content: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-master`);

        this.background = new Background();
        this.element.appendChild(this.background.element);

        this.content = document.createElement(`div`);
        this.content.classList.add(`xe-master-content`);
        this.element.appendChild(this.content);

        this.header = new Header();
        this.content.appendChild(this.header.element);
    }
}