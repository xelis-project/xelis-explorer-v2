# XELIS EXPLORER

The new real-time blockchain explorer for XELIS.

<https://explorer.xelis.io>  

- Real-time statistics with WebSockets.
- Navigate all blocks of the entire blockchain (if node isn't pruned).
- BlockDAG viewer.
- Live mempool.
- Peers location and node status.
- Transaction and contract informations.

Pages  

- Dashboard
- Blocks / block
- Transactions / transaction
- Accounts / account
- Mempool
- Assets
- Contracts / contract
- Peers
- DAG
- Settings

Testnet: <https://testnet-explorer.xelis.io>

## Under the hood

There is no Javascript framework. It's classes neatly orgranized using Web APIs.

## Developement

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```
