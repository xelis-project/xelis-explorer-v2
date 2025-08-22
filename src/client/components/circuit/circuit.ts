
import { svg_circuit } from "../../assets/svg/circuit";

export class Circuit {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.innerHTML = svg_circuit();
    }

    async load() {
        const { animate, eases, svg, stagger, utils } = await import("animejs");

        const paths = this.element.children[0].children;
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            path.setAttribute(`stroke-width`, `.${utils.random(.5, 2)}rem`);
        }
        
        animate(svg.createDrawable(paths), {
            draw: ['0 0', '0 1'],
            opacity: [0, 1, 0],
            ease: eases.outCirc,
            duration: 3000,
            delay: stagger(100),
            loop: true
        });
    }
}