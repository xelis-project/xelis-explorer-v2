import icons from '../../assets/svg/icons';

import './notification.css';

interface NotificationProps {
    data: HTMLElement | string;
    type: | "success" | "error";
    duration?: number;
}

export class Notification {
    element: HTMLDivElement;
    timeout_id?: number;

    constructor() {
        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-notification`);
    }

    add(props: NotificationProps) {
        window.clearTimeout(this.timeout_id);

        const item_element = document.createElement(`div`);
        item_element.classList.add(`xe-notification-item`, props.type);

        if (props.data instanceof HTMLElement) {
            item_element.appendChild(props.data);
        } else {
            item_element.innerHTML = props.data;
        }

        window.setTimeout(() => {
            item_element.classList.add(`show`);
        }, 50);

        const close_item = () => {
            item_element.classList.remove(`show`);
            window.setTimeout(() => {
                item_element.remove();
            }, 250);
        }

        const close_element = document.createElement(`button`);
        close_element.innerHTML = icons.close();
        close_element.classList.add(`xe-notification-close`);
        close_element.addEventListener(`click`, () => {
            close_item();
        });
        item_element.appendChild(close_element);

        this.element.insertBefore(item_element, this.element.firstChild);

        if (props.duration) {
            this.timeout_id = window.setTimeout(() => {
                close_item();
            }, props.duration);
        }
    }
}