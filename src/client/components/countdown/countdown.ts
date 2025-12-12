import { localization } from "../../localization/localization";

import './countdown.css';

export class Countdown {
	element: HTMLDivElement;

	target_timestamp?: number;
	constructor() {
		this.element = document.createElement(`div`);
		this.element.classList.add(`xe-countdown`);
		this.render();
	}

	set(target_timestamp: number) {
		this.target_timestamp = target_timestamp;
		this.render();
	}

	render() {
		let time_left = Math.max(0, (this.target_timestamp || 0) - Date.now());
		let seconds = Math.round(time_left / 1000);
		const days = Math.floor(seconds / 86400);
		seconds = Math.floor(seconds % 86400);
		const hours = Math.floor(seconds / 3600);
		seconds = Math.floor(seconds % 3600);
		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);

		this.element.innerHTML = `
			<div>
				<div>${days.toLocaleString(undefined, { minimumIntegerDigits: 2 })}</div>
				<div>${localization.get_text(`DAYS`)}</div>
			</div>
			<div>
				<div>${hours.toLocaleString(undefined, { minimumIntegerDigits: 2 })}</div>
				<div>${localization.get_text(`HOURS`)}</div>
			</div>
			<div>
				<div>${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}</div>
				<div>${localization.get_text(`MINUTES`)}</div>
			</div>
			<div>
				<div>${seconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })}</div>
				<div>${localization.get_text(`SECONDS`)}</div>
			</div>
		`;
	}
}