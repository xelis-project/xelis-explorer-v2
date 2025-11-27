import { TESTNET_NODE_RPC } from '@xelis/sdk/config';
import { RPC as DaemonRPC } from '@xelis/sdk/daemon/rpc'
import fs from 'fs';

async function main() {
    const daemonRPC = new DaemonRPC(TESTNET_NODE_RPC);

    let start = 0;
    let end = await daemonRPC.getHeight();
    let output_path = `./txs.json`;
    let txs = [] as any[];

    for (let i = start; i < end; i += 20) {
        const blocks = await daemonRPC.getBlocksRangeByHeight({
            start_height: i,
            end_height: Math.min(end, i + 19)
        });

        console.log(`Block ${i}`);

        for (let a = 0; a < blocks.length; a++) {
            const block = blocks[a];
            const tx_count = block.txs_hashes.length;
            if (tx_count > 0) {
                txs = [...txs, ...block.txs_hashes];
                console.log(`${tx_count} txs`);
            }
        }
    }

    fs.writeFileSync(output_path, JSON.stringify(txs), { encoding: `utf-8` });
}

main();
