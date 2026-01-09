import { Block, Transaction, RPCMethod as DaemonRPCMethod } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../app/xelis_node";
import { RPCRequest } from "@xelis/sdk/rpc/types";

export const fetch_blocks_txs = async (blocks: Block[]) => {
    const node = XelisNode.instance();

    const txs_hashes = [] as string[];

    // the same transaction can happear in side block (we have to account for this usecase)
    const tx_blocks_map = new Map<string, string[]>();

    blocks.map(block => {
        block.txs_hashes.forEach(tx_hash => {
            const block_hashes = tx_blocks_map.get(tx_hash);
            if (block_hashes) {
                tx_blocks_map.set(tx_hash, [...block_hashes, block.hash]);
            } else {
                txs_hashes.push(tx_hash);
                tx_blocks_map.set(tx_hash, [block.hash]);
            }
        });
    });

    let requests = [] as RPCRequest[];
    const batch_size = 20;
    for (let i = 0; i < txs_hashes.length; i += batch_size) {
        requests.push({
            method: DaemonRPCMethod.GetTransactions,
            params: { tx_hashes: txs_hashes.slice(i, i + batch_size) }
        });
    }

    const res = await node.rpc.batchRequest(requests);
    res.forEach((result) => {
        if (result instanceof Error) {
            throw result;
        } else {
            const txs = result as Transaction[];
            txs.forEach((tx) => {
                const block_hashes = tx_blocks_map.get(tx.hash);
                if (block_hashes) {
                    block_hashes.forEach((block_hash) => {
                        const block = blocks.find(b => b.hash === block_hash);

                        if (block) {
                            if (!block.transactions) block.transactions = [];
                            block.transactions.push(tx);
                        }
                    });
                }
            });
        }
    });
}