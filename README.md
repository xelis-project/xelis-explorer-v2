WORK IN PROGRESS

# XELIS EXPLORER (V2 BABY)

Real-time Blockchain Explorer for XELIS.

<https://explorer.xelis.io>  

- Real-time statistics with WebSockets.
- Navigate all blocks of the entire blockchain (if node isn't pruned).
- Block page.
- Transaction page.
- Accounts list page.
- Account history page.
- Live mempool.
- BlockDAG viewer.

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

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Production
