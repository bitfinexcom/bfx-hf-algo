## HF Algorithmic Orders

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo)

This repo contains an algorithmic order system built on top of the Bitfinex node API, along with three algo orders: `Iceberg`, `TWAP`, and `Accumulate/Distribute`

### Usage

To use, create an `AOHost` instance and call `startAO(id, args)`:

```js
const { AOHost, Iceberg, TWAP, AccumulateDistribute } = require('bfx-hf-algo')

const host = new AOHost({
  aos: [Iceberg, TWAP, AccumulateDistribute],
  apiKey: '...',
  apiSecret: '...',
  wsURL: '...',
  restURL: '...',
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
  const gid = await host.startAO('bfx.iceberg', {
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

### Algo Order Host

The `AOHost` class provides a wrapper around the algo order system, and manages lifetime events/order execution. Internally it hosts a `Manager` instance from `bfx-api-node-core` for communication with the Bitfinex API, and listens for websocket stream events in order to update order state/trigger algo order events.

Execution is handled by an event system, with events being triggered by Bitfinex API websocket stream payloads, and the algo orders themselves.

The host must be instantiated with a valid API key/secret pair, and websocket/REST endpoints, along with an optional proxy agent. These parameters are the same as those passed to the `bfx-api-node-core` `Manager` constructor. Note that the `Manager` is instantiated with the dead-man-switch active (dms: 4).

To start/stop algo orders, `gid = startAO(id, args)` and `stopAO(gid)` methods are provided, with the generated group ID (`gid`) being the same as that used for all atomic orders created by the individual algo orders.

See the above usage example for instantiation

## Algo Order System
Algorithmic orders are defined by an ID/Name pair, a set of meta functions describing the order, and a set of event handlers to be triggered during the orders lifetime/execution. A `defineAlgoOrder` helper is provided to construct the final AO definition object:

```js
const AO = defineAlgoOrder({
  id: 'some.ao.identifier',
  name: 'Descriptive AO Label',

  // meta functions describing the order/execution environment
  meta: {
    validateParams,  // validates processed parameters
    processParams,   // prepares raw parameters for execution
    declareEvents,   // declares/hooks up custom internal event handlers
    declareChannels, // declares needed data channels, to be managed by the AO host
    getUIDef,        // returns the Bitfinex Order Form definition schema
    genOrderLabel,   // constructs a label for generated atomic orders
    genPreview,      // generates preview orders for rendering in the bfx UI
    initState,       // creates the initial AO state object
    serialize,       // serializes state for DB persistence
    unserialize,     // unserializes loaded DB states for execution
  },

  events: {
    self: {
      // internal events, bound in declareEvents()
    },

    life: {
      start, // triggered on execution start, should handle initialisation
      stop,  // triggered on execution stop, should handle teardown
    },

    orders: {
      order_snapshot, // triggered upon receival of an account order snapshot
      order_new,      // triggered when a new order is opened
      order_update,   // triggered when an order is updated
      order_close,    // triggered when an order is closed
      order_fill,     // triggered on any order fill (order new/update/close)
      order_cancel,   // triggered when an order is closed via cancellation
    },

    data: {
      managedCandles, // triggered by receipt of a managed candle dataset
      managedBook,    // triggered by receipt of a managed order book
      notification,   // triggered by receipt of a notification
      candles,        // triggered by receipt of candles
      ticker,         // triggered by receipt of a ticker
      trades,         // triggered by receipt of trades
      book,           // triggered by receipt of an order book snapshot/update
    },

    errors: {
      minimum_size,   // triggered when an order fails due to being below the
                      // minimum size for its symbol; the AO may need to be stopped
    }
  }
})
```

### AO Event Handlers & Helpers
All event handlers receive the same arguments: `(instance = {}, ...args)`. The instance contains two objects, `{ state = {}, h = {} }` with `state` being the current AO state, and `h` being a helper object.

The provided helpers are:
* `debug(str, ...args)` - for logging information to the console, tagged by AO GID
* `emitSelf(eventName, ...args)` - triggers an event on the 'self' section
* `emitSelfAsync(eventName, ...args)` - same as `emitSelf` but operates on next tick
* `emit(eventName, ...args)` - raw event emitter, i.e. `emit('life:start')`
* `emitAsync(eventName, ...args)` - same as `emit` but operates on next tick
* `notifyUI(level, message)` - generates and sends a notification which appears on the Bitfinex UI
* `cancelOrderWithDelay(state, delay, order)` - takes current algo state, delay in ms
* `cancelAllOrdersWithDelay(state, delay)` - cancels all active atomic orders on the AO state, delay in ms
* `submitOrderWithDelay(state, delay, order)` - takes current algo state, submits a new order, delay in ms
* `declareEvent(instance, host, eventName, path)` - declares an internal AO event, see section below
* `declareChannel(instance, host, channel, filter)` - declares a required data channel, see section below
* `updateState(instance, update)` - update the current state for an AO instance

### Custom AO Event Handlers
To declare custom events to be triggered by the `emitSelf` or `emitSelfAsync` helpers, use the `declareEvent` helper inside of the `declareEvents` meta method in order to register the event names on AO startup. For an example, see the `Iceberg` event definition handler:

```js
module.exports = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  // All declared events are expected to be handled on the 'self' section, but can have any path/label

  // Map self:submit_order to the 'submit_order' handler
  declareEvent(instance, host, 'self:submit_order', 'submit_order')

  // Map self:interval_tick to the 'interval_tick' handler
  declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
}
```

Later, these events are triggered within other `Iceberg` event handlers, such as `submit_orders` within the `life:start` handler:

```js
module.exports = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  // ...

  await emitSelf('submit_orders')
}
```

### Subscribing to Data Channels
To subscribe to Bitfinex websocket API data channels, use the `declareChannel` helper within the `declareChannels()` meta method. Channel subscribe/unsubscribe calls will be handled automatically by the AO host during execution, with the relevant data being passed to the `data` section event handlers upon receival. For an example, see the `TWAP` channel declaration:

```js
module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, priceTarget } = args
  const { declareChannel } = h

  if (hasTradeTarget(args)) {
    await declareChannel(instance, host, 'trades', { symbol })
  } else if (hasOBTarget(args)) {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  } else {
    throw new Error(`invalid price target ${priceTarget}`)
  }
}
```

## Iceberg Order Type
Iceberg allows you to place a large order on the market while ensuring only a small part of it is ever filled at once. By enabling the 'Excess As Hidden' option, it is possible to offer up the remainder as a hidden order, allowing for minimal market disruption when executing large trades.

Example:
```js
await host.startAO('bfx.iceberg', {
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
```
 
## TWAP Order Type
TWAP spreads an order out through time in order to fill at the time-weighted average price, calculated between the time the order is submitted to the final atomic order close.

The price can be specified as a fixed external target, such as the top bid/ask or last trade price, or as an explicit target which must be matched against the top bid/ask/last trade/etc.

Available price targets/explicit target conditions:
* OB side price (top bid/ask)
* OB mid price
* Last trade price

Example:
```js
await host.startAO('bfx.twap', {
  symbol: 'tBTCUSD',
  amount: -0.5,
  sliceAmount: -0.1,
  sliceInterval: 10,
  priceDelta: 100, // max distance from price target to fulfill condition
  priceTarget: 16650,
  priceCondition: TWAP.Config.PRICE_COND.MATCH_LAST,
  tradeBeyondEnd: false,
  orderType: 'LIMIT',
  submitDelay: 150,
  cancelDelay: 150,
  _margin: false
})
```

## Accumulate/Distribute Order Type
Accumulate/Distribute allows you to break up a large order into smaller randomized chunks, submitted at regular or irregular intervals to minimise detection by other players in the market.

By enabling the 'Await Fill' option, the algorithm will ensure each component fills before submitting subsequent orders. Enabling the 'Catch Up' flag will cause the algorithm to ignore the slice interval for the next order if previous orders have taken longer than expected to fill, thereby ensuring the time-to-fill for the entire order is not adversely affected.

The price must be manually specified as `limitPrice` for `LIMIT` order types, or as a combination of a price offset & cap for `RELATIVE` order types. `MARKET` A/D orders execute using `MARKET` atomic orders, and offer no price control.

For `RELATIVE` A/D orders, the price offset & cap can both be set to one of the following:
* Top ask
* Top bid
* Orderbook mid price
* Last trade price
* Moving Average (configurable period, time frame, candle price)
* Exponential Moving Average (configurable period, time frame, candle price)

The period limit for moving average targets/caps is `240`, being the number of candles returned by the Bitfinex API when subscribing to a candle data channel.

Example:
```js
await host.startAO('bfx.accumulate_distribute', {
  symbol: 'tBTCUSD',
  amount: -0.2,
  sliceAmount: -0.1,
  sliceInterval: 10000,
  intervalDistortion: 0.20, // %
  amountDistortion: 0.20, // %
  orderType: 'RELATIVE', // MARKET, LIMIT, RELATIVE
  relativeOffset: { type: 'ask', args: [20], delta: -10 },
  relativeCap: { type: 'bid', delta: 10 },
  submitDelay: 150,
  cancelDelay: 150,
  catchUp: true, // if true & behind, ignore slice interval (after prev fill)
  awaitFill: true, // await current slice fill before continuing to next slice
  _margin: false,
})
```

## Execution via the Bitfinex UI
To execute these algo orders via the standard Bitfinex UI, see the [bfx-hf-algo-server](https://github.com/bitfinexcom/bfx-hf-algo-server) repo, which uploads the relevant Order Form definitions and listens for preview/submit notifications on the bfx API to start algo orders with parameters taken from the UI order form.
