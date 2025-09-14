import * as nouislider from 'nouislider';

// import 'nouislider/dist/nouislider.css';
import './dag_slider.css';
import './height_control.css';
import { EventEmitter } from '../../../utils/event_emitter';

interface HeightControlEventMap {
    new_height: number
}

export class HeightControl extends EventEmitter<HeightControlEventMap> {
    element: HTMLElement;

    height_slider_element: HTMLDivElement;
    height_slider: nouislider.API;
    height_input_element: HTMLInputElement;
    live_btn_element: HTMLButtonElement;

    constructor() {
        super();

        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-dag-height-control`);

        const inputs_container = document.createElement(`div`);
        inputs_container.classList.add(`xe-dag-height-control-inputs`);

        this.live_btn_element = document.createElement(`button`);
        this.live_btn_element.innerHTML = `LIVE`;
        this.live_btn_element.addEventListener(`click`, () => {

        });
        inputs_container.appendChild(this.live_btn_element);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = `HEIGHT`;
        inputs_container.appendChild(title_element);

        this.height_input_element = document.createElement(`input`);

        this.height_input_element.type = `text`;
        this.height_input_element.name = `xe-dag-height-control`;
        this.height_input_element.addEventListener(`change`, (e) => {
            const target = e.target as HTMLInputElement;
            const new_height = parseInt(target.value);
            this.set_height(new_height);
        });
        inputs_container.appendChild(this.height_input_element);

        this.element.appendChild(inputs_container);

        this.height_slider_element = document.createElement(`div`);

        const format_from = (value: string) => {
            const value_str = value.toString().replaceAll(`,`, ``);
            return parseInt(value_str);
        }

        const format_to = (value: number) => {
            return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        }

        this.height_slider = nouislider.create(this.height_slider_element, {
            cssPrefix: `dag-slider-`,
            start: 50,
            step: 1,
            tooltips: {
                to: format_to
            },
            range: { min: 0, max: 100 },
            pips: {
                mode: nouislider.PipsMode.Count,
                values: 6,
                format: {
                    to: format_to
                }
            },
            format: {
                from: format_from,
                to: format_to
            }
        });

        this.height_slider.on(`set`, (value) => {
            const value_str = value.toString().replaceAll(`,`, ``);
            this.height_input_element.value = `${value_str}`;
            this.emit(`new_height`, parseInt(value_str));
        });

        this.element.appendChild(this.height_slider_element);
    }

    set_height(height: number) {
        this.height_slider.updateOptions({
            start: height
        }, true);
    }

    set_max_height(max_height: number) {
        this.height_slider.updateOptions({
            range: { min: 0, max: max_height }
        }, false);
    }
}