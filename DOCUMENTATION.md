# Bitfinex Honey Framework Algorithmic Order Library for Node.JS

This library implements an algorithmic order system using the Bitfinex Node.JS
API, and provides several official algo orders which serve as reference
implementations.

The system is exchange-agnostic and relies on external adapter libraries for the
actual exchange API connection. For bitfinex, this adapter is provided by the
[bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex) library.

### Features

* Event-driven [Algorithm Host]{@link module:AOHost}
* Plugin-based exchange API connection, enabling the development of adapters for new exchanges
* [TWAP]{@link module:TWAP}
* [Ping/Pong]{@link module:PingPong}
* [Accumulate/Distribute]{@link module:AccumulateDistribute}
* [MA Crossover]{@link module:MACrossover}
* [Iceberg]{@link module:Iceberg}
* [OCOCO]{@link module:OCOCO}

### Installation

```bash
npm i --save bfx-hf-algo
npm i --save bfx-hf-ext-plugin-bitfinex
npm i --save bfx-hf-models-adapter-lowdb
```

### Architecture

Refer to {@tutorial Architecture} for an in-depth review of the algorithmic
order system and execution environment. The library provides the following
components for building your own order types:

* {@link AOHost} - algorithmic order host, which provides the execution environment
* [Helpers]{@link module:Helpers} - async methods provided to orders during execution for
    submitting & cancelling orders, and triggering events to be handled either
    by themselves or by the algo host.

### Quickstart & Example

To get started, initialize an `AOAdapter` and `HFDB` instance, then pass them
to a new `AOHost` instance and call `startAO(id, args)`:

```js
const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  AOAdapter,
  schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const {
  AOHost, PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('bfx-hf-algo')

const host = new AOHost({
  aos: [PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover],
  adapter: new AOAdapter({
    apiKey: '...',
    apiSecret: '...',
    dms: 4
  }),

  db: new HFDB({
    schema: HFDBBitfinexSchema,
    adapter: HFDBLowDBAdapter({
      dbPath: `${__dirname}/db.json`,
    })
  })
})

host.on('ao:start', (instance) => {
  const { state = {} } = instance
  const { id, gid } = state
  console.log('started AO %s [gid %s]', id, gid)
})

host.on('ao:stop', (instance) => {
  const { state = {} } = instance
  const { id, gid } = state
  console.log('stopped AO %s [gid %s]', id, gid)
})

host.on('ws2:auth:error', (packet) => {
  console.log('error authenticating: %j', packet)
})

host.on('error', (err) => {
  console.log('error: %s', err)
})

host.once('ws2:auth:success', async () => {

  // Start an Iceberg order instance
  const gid = await host.startAO('bfx-iceberg', {
    symbol: 'tBTCUSD',
    price: 21000,
    amount: -0.5,
    sliceAmount: -0.1,
    excessAsHidden: true,
    orderType: 'LIMIT',
    submitDelay: 150,
    cancelDelay: 150,
    _margin: false,
  })

  // later, host.stopAO(gid)
})
```

### Docs

[Refer to the `docs/`](/docs) folder for JSDoc-generated API documentation.

### Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
