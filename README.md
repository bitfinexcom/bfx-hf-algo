# Bitfinex Honey Framework Algorithmic Order Library for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo)

For a description of the included algo orders, see our [user docs](./user-docs.md)

### Installation

```bash
npm i --save bfx-hf-algo
npm i --save bfx-hf-models
npm i --save bfx-hf-ext-plugin-bitfinex
npm i --save bfx-hf-models-adapter-lowdb
```

### Quickstart & Example

To get started, create an object wsSettings required for `AOAdapter`,
then pass them to a new `AOHost` instance and call `startAO(id, args)`:

```js
const {
  AOHost, PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('bfx-hf-algo')

const HFDB = require('bfx-hf-models')	
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')	
const {	
  schema: HFDBBitfinexSchema	
} = require('bfx-hf-ext-plugin-bitfinex')

const algoDB = new HFDB({	
  schema: HFDBBitfinexSchema,	
  adapter: HFDBLowDBAdapter({	
    dbPath: path.join(__dirname, '..', 'db', 'example.json')	
  })	
})

const host = new AOHost({
  aos: [PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover],
  wsSettings: {
    apiKey: '...',
    apiSecret: '...',
    dms: 4
  }
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

host.on('ao:persist:db:update', async(updateOpts) => {
  const { AlgoOrder } = algoDB  //algoDB is the low-adapter DB for algo
  await AlgoOrder.set(updateOpts)
  console.log('ao instance updated %s', updateOpts.gid)
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
