export class Row {
    element: HTMLTableRowElement;
    cells: HTMLTableCellElement[];
    value_cells: HTMLDivElement[];

    constructor(cell_count: number) {
        this.element = document.createElement(`tr`);

        this.cells = [];
        this.value_cells = [];
        for (let i = 0; i < cell_count; i++) {
            const cell = document.createElement(`td`);
            this.element.appendChild(cell);

            const value_cell = document.createElement(`div`);
            cell.appendChild(value_cell);

            this.value_cells.push(value_cell);
            this.cells.push(cell);
        }
    }

    set_link(href: string) {
        this.cells.forEach((cell, i) => {
            cell.replaceChildren();

            const link = document.createElement(`a`);
            link.href = href;
            link.appendChild(this.value_cells[i]);

            cell.appendChild(link);
        });
    }

    set_loading(loading: boolean) {
        if (loading) {
            this.element.classList.add(`xe-block-tx-row-loading`);
        } else {
            this.element.classList.remove(`xe-blocks-tx-row-loading`);
        }
    }
}