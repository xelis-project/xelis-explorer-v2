import './table.css';

export class Table {
    element: HTMLTableElement;
    head_element: HTMLTableSectionElement;
    body_element: HTMLTableSectionElement

    constructor() {
        this.element = document.createElement(`table`);
        this.element.classList.add(`xe-table`);

        this.head_element = document.createElement(`thead`);
        this.element.appendChild(this.head_element);

        this.body_element = document.createElement(`tbody`);
        this.element.appendChild(this.body_element);
    }

    set_head_row(titles: string[]) {
        this.head_element.replaceChildren();
        const row = document.createElement(`tr`);
        this.head_element.appendChild(row);
        titles.forEach(title => {
            const col = document.createElement(`th`);
            col.innerHTML = title;
            row.appendChild(col);
        });
    }

    prepend_row(row: HTMLTableRowElement) {
        this.body_element.insertBefore(row, this.body_element.firstChild);
    }

    set_loading(count: number) {
        for (let i = 0; i < count; i++) {
            const empty_row = this.add_empty_row();
            empty_row.classList.add(`xe-table-loading`);
        }
    }

    add_empty_row() {
        const headers = this.head_element.querySelectorAll(`tr th`);
        const row = document.createElement(`tr`);
        const cell = document.createElement(`td`);
        cell.colSpan = headers.length;
        row.appendChild(cell);
        this.body_element.appendChild(row);
        return row;
    }

    set_empty_row(value: string) {
        this.body_element.replaceChildren();
        const empty_row = this.add_empty_row();
        empty_row.innerHTML = value;
    }

    set_clickable() {
        this.element.classList.add(`xe-table-clickable`);
    }

    remove_last() {
        const last_child = this.body_element.lastChild;
        if (last_child) last_child.remove();
    }
}