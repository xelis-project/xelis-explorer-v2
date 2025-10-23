import { Background } from "../background/background";
import { Header } from "../header/header";

import './master.css';

export class Master {
    element: HTMLDivElement;

    background: Background;
    header: Header;

    layout: HTMLDivElement;
    content: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-master`);

        this.background = new Background();
        this.element.appendChild(this.background.element);

        this.layout = document.createElement(`div`);
        this.layout.classList.add(`xe-master-layout`);
        this.element.appendChild(this.layout);

        this.header = new Header();
        this.layout.appendChild(this.header.element);

        this.content = document.createElement(`div`);
        this.content.classList.add(`xe-master-content`);
        this.layout.appendChild(this.content);
    }
}