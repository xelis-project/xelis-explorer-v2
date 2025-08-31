import { Block, RPCMethod as DaemonRPCMethod, Transaction } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../app/xelis_node";
import { RPCRequest } from "@xelis/sdk/rpc/types";

export const fetch_block_txs = async (block: Block) => {
    const node = XelisNode.instance();

    const tx_count = block.txs_hashes.length;
    const batch_size = 20;

    const requests = [] as RPCRequest[];

    for (let i = 0; i < tx_count; i += batch_size) {
        requests.push({
            method: DaemonRPCMethod.GetTransactions,
            params: { tx_hashes: block.txs_hashes.slice(i, batch_size) }
        });
    }

    const res = await node.rpc.batchRequest(requests);
    res.forEach((result) => {
        if (result instanceof Error) {
            throw result;
        } else {
            const txs = result as Transaction[];
            if (!block.transactions) block.transactions = [];
            block.transactions = [...block.transactions, ...txs];
        }
    })
}