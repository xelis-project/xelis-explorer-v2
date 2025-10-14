import { TESTNET_NODE_RPC } from '@xelis/sdk/config';
import { RPC as DaemonRPC } from '@xelis/sdk/daemon/rpc'

async function main() {
    const daemonRPC = new DaemonRPC(TESTNET_NODE_RPC);

    for (let i = 900; i < 20000; i += 20) {
        const blocks = await daemonRPC.getBlocksRangeByHeight({
            start_height: i,
            end_height: i + 19
        });

        console.log(i);
        for (let a = 0; a < blocks.length; a++) {
            const block = blocks[a];
            if (block.txs_hashes.length > 0) {
                console.log(block.txs_hashes)
            }
        }
    }
}

main();
