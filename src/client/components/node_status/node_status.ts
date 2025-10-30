import icons from '../../assets/svg/icons';
import { XelisNode } from '../../app/xelis_node';

import './node_status.css';

export class NodeStatus {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);

        const node = XelisNode.instance();

        const reconnect_element = document.createElement(`div`);
        reconnect_element.classList.add(`xe-node-status-reconnect`);

        const reconnect_container = document.createElement(`div`);
        reconnect_element.appendChild(reconnect_container);

        const reconnect_text_element = document.createElement(`div`);
        reconnect_container.appendChild(reconnect_text_element);

        const reconnect_button_element = document.createElement(`button`);
        reconnect_button_element.innerHTML = `${icons.connect()} RECONNECT`;
        reconnect_button_element.addEventListener(`click`, () => {
            location.reload();
        });
        reconnect_container.appendChild(reconnect_button_element);

        node.ws.socket.addEventListener(`open`, (e) => {
            console.log(`OPEN: `, e);
        });

        node.ws.socket.addEventListener(`error`, (e) => {
            console.log(`ERROR: `, e);

            if (!this.element.contains(reconnect_button_element)) {
                reconnect_text_element.innerHTML = `An error occured with the node websocket connection.`;
                this.element.appendChild(reconnect_element);
            }
        });

        node.ws.socket.addEventListener(`close`, (e) => {
            console.log(`CLOSE: `, e);

            if (!this.element.contains(reconnect_button_element)) {
                reconnect_text_element.innerHTML = `The node websocket connection closed.`;
                this.element.appendChild(reconnect_element);
            }
        });
    }
}