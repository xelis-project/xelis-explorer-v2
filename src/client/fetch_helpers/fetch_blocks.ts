import { RPCRequest } from "@xelis/sdk/rpc/types";
import { XelisNode } from "../app/xelis_node"
import { Block, HeightRangeParams, RPCMethod } from "@xelis/sdk/daemon/types";

export const fetch_blocks = async (end_height: number, count: number) => {
    const node = XelisNode.instance();

    const requests = [] as RPCRequest[];
    const batch_size = 20;
    const batch_count = count / batch_size;

    for (let i = 0; i < batch_count; i++) {
        requests.push({
            method: RPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: end_height - (i * batch_size + batch_size),
                end_height: end_height - (i * batch_size)
            } as HeightRangeParams
        });
    }

    let blocks = [] as Block[];
    const res = await node.rpc.batchRequest(requests);
    res.forEach(result => {
        if (result instanceof Error) {
            throw result;
        } else {
            blocks = [...blocks, ...result as Block[]];
        }
    });

    blocks.sort((a, b) => a.height - b.height);
    return blocks;
}