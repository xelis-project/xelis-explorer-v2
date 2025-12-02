import { localization } from '../../localization/localization';
import { EventEmitter } from '../../utils/event_emitter';

import './pagination.css';

interface PaginationEventMap {
    page_change: number;
}

export class Pagination extends EventEmitter<PaginationEventMap> {
    element: HTMLElement;

    sibling_count?: number; // nbr of pages to show around current
    show_first_last: boolean;
    show_prev_next: boolean;
    current_page: number;
    total_items: number;
    page_size: number;

    constructor() {
        super();

        this.element = document.createElement(`div`);
        this.element.classList.add(`xe-pagination`);

        this.show_first_last = true;
        this.show_prev_next = true;
        this.current_page = 0;
        this.total_items = 0;
        this.page_size = 0;
    }

    render() {
        this.element.replaceChildren();

        const total_pages = Math.ceil(this.total_items / this.page_size);

        // first btn
        if (this.show_first_last && this.current_page > 1) {
            this.append_page_btn(1, localization.get_text('First'));
        }

        // prev btn
        if (this.show_prev_next && this.current_page > 1) {
            this.append_page_btn(this.current_page - 1, localization.get_text('Previous'));
        }

        // page btns
        const sibling_count = this.sibling_count ?? 1;
        const start = Math.max(1, this.current_page - sibling_count);
        const end = Math.min(total_pages - 1, this.current_page + sibling_count);

        for (let i = start; i <= end; i++) {
            this.append_page_btn(i, i.toString());
        }

        // next btn
        if (this.show_prev_next && this.current_page < total_pages) {
            this.append_page_btn(this.current_page + 1, localization.get_text('Next'));
        }

        // last btn
        if (this.show_first_last && this.current_page < total_pages) {
            this.append_page_btn(total_pages, localization.get_text('Last'));
        }

        const count_element = document.createElement(`div`);
        count_element.classList.add(`xe-pagination-count`);
        count_element.innerHTML = `${this.total_items.toLocaleString()} items`;
        this.element.appendChild(count_element);
    }

    append_page_btn(page: number, html: string) {
        const btn = document.createElement('button');
        btn.type = 'button';
        if (page === this.current_page) {
            btn.classList.add(`active`);
        }

        btn.innerHTML = html;
        btn.title = `Go to page ${page}`;
        btn.addEventListener('click', () => {
            this.current_page = page;
            this.emit(`page_change`, page);
        });

        this.element.appendChild(btn);
    }
}
