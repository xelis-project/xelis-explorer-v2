import { Box } from "../../../../components/box/box";
import { JsonViewer } from "../../../../components/json_viewer/json_viewer";

import './json_viewer_box.css';

export class JsonViewerBox {
    box: Box;

    constructor(data: any) {
        this.box = new Box();
        this.box.element.classList.add(`xe-json-viewer-box`, `scrollbar-1`, `scrollbar-1-right`);
        const json_viewer = new JsonViewer();
        json_viewer.set_data(JSON.parse(JSON.stringify(data)));
        this.box.element.appendChild(json_viewer.element);
    }
}