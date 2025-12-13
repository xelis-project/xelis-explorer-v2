
import icons from '../../assets/svg/icons';

import './prev_next_pager.css';

export class PrevNextPager {
	element: HTMLDivElement;
	status_element: HTMLDivElement;
	prev_btn: HTMLButtonElement;
	next_btn: HTMLButtonElement;

	pager_numbers: number[] = [];
	pager_max?: number;
	pager_min?: number;
	pager_current?: number;
	pager_next?: number;
	load_func?: () => void;

	constructor() {
		this.element = document.createElement(`div`);
		this.element.classList.add(`xe-prev-next-pager`);

		this.prev_btn = document.createElement(`button`);
		this.prev_btn.classList.add(`prev`);
		this.prev_btn.innerHTML = icons.arrow() + `PREV`;
		this.prev_btn.addEventListener(`click`, () => {
			this.pager_numbers.pop();
			if (this.load_func) this.load_func();
		});
		this.element.appendChild(this.prev_btn);

		this.next_btn = document.createElement(`button`);
		this.next_btn.classList.add(`next`);
		this.next_btn.innerHTML = `NEXT` + icons.arrow();
		this.next_btn.addEventListener(`click`, () => {
			if (!this.pager_next) return;
			this.pager_numbers.push(this.pager_next);
			if (this.load_func) this.load_func();
		});

		this.status_element = document.createElement(`div`);
	}

	get_next() {
		return this.pager_numbers[this.pager_numbers.length - 1];
	}

	render() {
		if (!this.pager_current || !this.pager_next) {
			return;
		}

		this.element.replaceChildren();

		if (this.pager_max !== undefined && this.pager_current < this.pager_max) {
			this.element.appendChild(this.prev_btn);
		}

		if (this.pager_min !== undefined && this.pager_next > this.pager_min) {
			this.element.appendChild(this.next_btn);
		}

		this.status_element.innerHTML = `From ${this.pager_current.toLocaleString()} to ${this.pager_next.toLocaleString()}`;
		this.element.appendChild(this.status_element);
	}
}