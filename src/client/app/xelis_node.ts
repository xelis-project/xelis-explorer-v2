import { Singleton } from "../utils/singleton";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import DaemonWS from '@xelis/sdk/daemon/websocket';

export class XelisNode extends Singleton<XelisNode> {
    rpc: DaemonRPC;
    ws: DaemonWS;

    static rpc_node_endpoint: string = `https://node.xelis.io/json_rpc`;
    static ws_node_endpoint: string = `wss://node.xelis.io/json_rpc`;

    constructor() {
        super();
        this.rpc = new DaemonRPC(XelisNode.rpc_node_endpoint);
        this.ws = new DaemonWS(XelisNode.ws_node_endpoint);
    }

    set_rpc_endpoint(endpoint: string) {
        XelisNode.rpc_node_endpoint = endpoint;
        this.rpc = new DaemonRPC(XelisNode.rpc_node_endpoint);
    }

    set_ws_endpoint(endpoint: string) {
        XelisNode.ws_node_endpoint = endpoint;
        this.ws.socket.close();
        this.ws = new DaemonWS(XelisNode.ws_node_endpoint);
    }
}