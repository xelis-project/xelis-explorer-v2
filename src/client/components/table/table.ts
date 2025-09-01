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

    set_empty_row(value: string, colspan: number) {
        const row = document.createElement(`tr`);
        const cell = document.createElement(`td`);
        cell.colSpan = colspan;
        cell.innerHTML = value;
        row.appendChild(cell);
        this.body_element.replaceChildren();
        this.body_element.appendChild(row);
    }

    set_row_loading(row: HTMLTableRowElement, loading: boolean) {
        if (loading) {
            row.classList.add(`xe-table-loading`);
        } else {
            row.classList.remove(`xe-table-loading`);
        }
    }

    set_clickable() {
        this.element.classList.add(`xe-table-clickable`);
    }

    remove_last() {
        const last_child = this.body_element.lastChild;
        if (last_child) last_child.remove();
    }
}