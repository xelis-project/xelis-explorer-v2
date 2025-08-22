import { svg_circuit } from '../../assets/svg/circuit';
import { Circuit } from '../circuit/circuit';

import './background.css';

export class Background {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-background`);

        const ellipse_1 = document.createElement(`div`);
        ellipse_1.classList.add(`xe-background-ellipse-1`);
        this.element.appendChild(ellipse_1);

        const ellipse_2 = document.createElement(`div`);
        ellipse_2.classList.add(`xe-background-ellipse-2`);
        this.element.appendChild(ellipse_2);

        const ellipse_3 = document.createElement(`div`);
        ellipse_3.classList.add(`xe-background-ellipse-3`);
        this.element.appendChild(ellipse_3);

        const circuit = new Circuit();
        //const circuit = document.createElement(`div`);
        circuit.element.classList.add(`xe-background-circuit`);
        //circuit.innerHTML = svg_circuit();
        this.element.appendChild(circuit.element);
        circuit.load();

        document.body.style.overflowX = `hidden`;
    }
}