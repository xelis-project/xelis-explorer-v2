import { Singleton } from "../utils/singleton";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import DaemonWS from '@xelis/sdk/daemon/websocket';

export class XelisNode extends Singleton<XelisNode> {
    rpc: DaemonRPC;
    ws: DaemonWS;

    static endpoint: string = `https://node.xelis.io/json_rpc`;

    constructor() {
        super();
        this.rpc = new DaemonRPC(XelisNode.endpoint);
        this.ws = new DaemonWS();
    }

    set_endpoint(endpoint: string) {
        XelisNode.endpoint = endpoint;
        this.rpc = new DaemonRPC(XelisNode.endpoint);
        this.ws = new DaemonWS();
        this.ws.connect(endpoint);
    }
}