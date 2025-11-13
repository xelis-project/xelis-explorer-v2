import { Singleton } from "../utils/singleton";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import DaemonWS from '@xelis/sdk/daemon/websocket';
import { Settings } from "./settings";

export class XelisNode extends Singleton {
    rpc: DaemonRPC;
    ws: DaemonWS;

    constructor() {
        super();

        const settings = Settings.instance();
        this.rpc = new DaemonRPC(settings.node_http_connection);
        this.rpc.timeout = 5000;
        this.ws = new DaemonWS(settings.node_ws_connection);
    }
}