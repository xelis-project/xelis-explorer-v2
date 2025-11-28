import { RPCRequest } from "@xelis/sdk/rpc/types";
import { XelisNode } from "../app/xelis_node"
import { Block, HeightRangeParams, RPCMethod } from "@xelis/sdk/daemon/types";

export const fetch_blocks = async (end_height: number, count: number) => {
    const node = XelisNode.instance();

    const requests = [] as RPCRequest[];
    const batch_size = 20;

    for (let i = end_height; i > Math.max(0, end_height - count); i -= batch_size) {
        requests.push({
            method: RPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: Math.max(-1, i - batch_size) + 1, // start height is inclusive we add 1
                end_height: i
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