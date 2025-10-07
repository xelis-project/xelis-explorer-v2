import { JsonViewer as JsonViewerElement } from '@alenaksu/json-viewer/JsonViewer.js';

import './json_viewer.css';

export class JsonViewer {
    element: JsonViewerElement;

    static initialize_import() {
        import("@alenaksu/json-viewer");
    }

    constructor() {
        this.element = document.createElement(`json-viewer`);
    }

    set_data(data: any) {
        this.element.data = data;
    }
}