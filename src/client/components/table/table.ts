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
}