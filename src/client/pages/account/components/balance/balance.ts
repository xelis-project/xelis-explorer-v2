import icons from "../../../../assets/svg/icons";
import { Container } from "../../../../components/container/container";

import './balance.css';

export class AccountBalance {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-balance`);

        const bg = document.createElement(`div`);
        bg.classList.add(`xe-account-balance-bg`);
        this.container.element.appendChild(bg);

        const mascot = document.createElement(`img`);
        mascot.src = `/images/xelite_content.png`;
        bg.appendChild(mascot);

        const icon = document.createElement(`div`);
        icon.innerHTML = icons.question_mark_shield();
        bg.appendChild(icon);

        const text = document.createElement(`div`);
        text.classList.add(`xe-account-balance-text`);
        text.innerHTML = `BALANCE<br>ENCRYPTED`;
        this.container.element.appendChild(text);
    }
}