## Modules

<dl>
<dt><a href="#module_bfx-hf-algo">bfx-hf-algo</a></dt>
<dd><p>This module implements an algorithmic order system using the Bitfinex
Node.JS API, and provides several official algo orders which serve as
reference implementations.</p>
<p>The system is exchange-agnostic and relies on external adapter libraries for
the actual exchange API connection. For bitfinex, this adapter is provided
by the <a href="https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex">bfx-hf-ext-plugin-bitfinex</a> module.</p>
<h3 id="db-backends">DB Backends</h3>
<p>Algo order persistence is handled by the <a href="https://github.com/bitfinexcom/bfx-hf-models">bfx-hf-models</a>
module, with supports multiple database backends. Currently two official
modules are provided:</p>
<ul>
<li><a href="https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb">bfx-hf-models-adapter-lowdb</a> for storage via <code>lowdb</code></li>
<li><a href="https://github.com/bitfinexcom/bfx-hf-models-adapter-sql">bfx-hf-models-adapter-sql</a> for storage via <code>knex</code>
configured for <code>PostgreSQL</code>.</li>
</ul>
<p><a href="https://github.com/bitfinexcom/bfx-hf-models-adapter-template">bfx-hf-models-adapter-template</a> provides an example of the
structure required to implement a custom database adapter.</p>
<h3 id="exchange-interfaces">Exchange Interfaces</h3>
<p><code>bfx-hf-algo</code> is designed to work with any exchange through the use of
adapter modules, providing a common API for algorithmic order execution.</p>
<ul>
<li><a href="https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex">bfx-hf-ext-plugin-bitfinex</a> implements this API for
<a href="https://bitfinex.com">Bitfinex</a>.</li>
<li><a href="https://github.com/bitfinexcom/bfx-hf-ext-plugin-dummy">bfx-hf-ext-plugin-dummy</a> provides an example of the
required structure.</li>
</ul>
</dd>
<dt><a href="#module_bfx-hf-algo/AccumulateDistribute">bfx-hf-algo/AccumulateDistribute</a></dt>
<dd><p>Accumulate/Distribute allows you to break up a large order into smaller
randomized chunks, submitted at regular or irregular intervals to minimise
detection by other players in the market.</p>
<p>By enabling the &#39;Await Fill&#39; option, the algorithm will ensure each
component fills before submitting subsequent orders. Enabling the &#39;Catch Up&#39;
flag will cause the algorithm to ignore the slice interval for the next order
if previous orders have taken longer than expected to fill, thereby ensuring
the time-to-fill for the entire order is not adversely affected.</p>
<p>The price must be manually specified as <code>limitPrice</code> for <code>LIMIT</code> order types,
or as a combination of a price offset &amp; cap for <code>RELATIVE</code> order types.
<code>MARKET</code> A/D orders execute using <code>MARKET</code> atomic orders, and offer no price
control.</p>
<p>For <code>RELATIVE</code> A/D orders, the price offset &amp; cap can both be set to one of
the following:</p>
<ul>
<li>Top ask</li>
<li>Top bid</li>
<li>Orderbook mid price</li>
<li>Last trade price</li>
<li>Moving Average (configurable period, time frame, candle price)</li>
<li>Exponential Moving Average (configurable period, time frame, candle price)</li>
</ul>
<p>The period limit for moving average targets/caps is <code>240</code>, being the number
of candles returned by the Bitfinex API when subscribing to a candle data
channel.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/DefaultErrorHandlers">bfx-hf-algo/DefaultErrorHandlers</a></dt>
<dd><p>Default error handlers attached to all algorithmic orders if no explicit
handlers are supplied.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/Helpers">bfx-hf-algo/Helpers</a></dt>
<dd><p>All algorithmic order event handlers receive the same arguments:
<code>(instance = {}, ...args)</code>. The instance contains two objects,
<code>{ state = {}, h = {} }</code> with <code>state</code> being the current AO state, and <code>h</code>
being a helper object.</p>
<p>The <code>h</code> helper object is an instance of this module bound to that specific
algorithmic order, providing methods for defining its own structure (custom
event names, required channels) and managing its lifecycle/execution.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/Iceberg">bfx-hf-algo/Iceberg</a></dt>
<dd><p>Iceberg allows you to place a large order on the market while ensuring only
a small part of it is ever filled at once. By enabling the &#39;Excess As Hidden&#39;
option, it is possible to offer up the remainder as a hidden order, allowing
for minimal market disruption when executing large trades.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/MACrossover">bfx-hf-algo/MACrossover</a></dt>
<dd><p>MA Crossover triggers either a <code>MARKET</code> or a <code>LIMIT</code> order when two
user-defined moving averages cross. Users can configure either a standard MA
or an EMA individually for both long &amp; short signals.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/OCOCO">bfx-hf-algo/OCOCO</a></dt>
<dd><p>Order Creates OCO (or OCOCO) triggers an OCO order after an initial MARKET
or LIMIT order fills.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/PingPong">bfx-hf-algo/PingPong</a></dt>
<dd><p>Ping/pong submits multiple &#39;ping&#39; orders; once a ping order fills, an
associated &#39;pong&#39; order is submitted.</p>
<p>Multiple ping/pong pairs can be created by specifying an order count greater
than 1, a suitable min/max ping price, and a pong distance. Multiple ping
orders will be created between the specified min/max prices, with the
associated pongs offset by the pong distance from the ping price.</p>
<p>When operating in &#39;endless&#39; mode, new ping orders will be submitted when
their associated pongs fill.</p>
</dd>
<dt><a href="#module_bfx-hf-algo/TWAP">bfx-hf-algo/TWAP</a></dt>
<dd><p>TWAP spreads an order out through time in order to fill at the time-weighted
average price, calculated between the time the order is submitted to the
final atomic order close.</p>
<p>The price can be specified as a fixed external target, such as the top
bid/ask or last trade price, or as an explicit target which must be matched
against the top bid/ask/last trade/etc.</p>
<p>Available price targets/explicit target conditions:</p>
<ul>
<li>OB side price (top bid/ask)</li>
<li>OB mid price</li>
<li>Last trade price</li>
</ul>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#AOHost">AOHost</a> ⇐ <code><a href="#AsyncEventEmitter">AsyncEventEmitter</a></code></dt>
<dd><p>The AOHost class provides a wrapper around the algo order system, and
manages lifetime events/order execution. Internally it hosts a Manager
instance from bfx-api-node-core for communication with the Bitfinex API, and
listens for websocket stream events in order to update order state/trigger
algo order events.</p>
<p>Execution is handled by an event system, with events being triggered by
Bitfinex API websocket stream payloads, and the algo orders themselves.</p>
<p>To start/stop algo orders, <code>gid = startAO(id, args)</code> and <code>stopAO(gid)</code>
methods are provided, with the generated group ID (<code>gid</code>) being the same as
that used for all atomic orders created by the individual algo orders.</p>
</dd>
<dt><a href="#AsyncEventEmitter">AsyncEventEmitter</a></dt>
<dd><p>Event emitter class that provides an async <code>emit</code> function, useful for when
one needs to <code>await</code> the event and all of its listeners.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#defineAlgoOrder">defineAlgoOrder(definition)</a> ⇒ <code>object</code></dt>
<dd><p>Attaches default handlers if not supplied &amp; returns the algo order definition</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AOInstance">AOInstance</a> : <code>object</code></dt>
<dd><p>An object containing all state for an algorithmic order instance. Includes
the <a href="#AsyncEventEmitter">AsyncEventEmitter</a> instance used to trigger internal order logic.</p>
</dd>
<dt><a href="#AOUIDefinition">AOUIDefinition</a> : <code>object</code></dt>
<dd><p>Object describing the layout and components of the submission form presented
to the user for an individual algorithmic order. For examples, refer to any
of the algorithmic orders provided by <a href="#module_bfx-hf-algo">bfx-hf-algo</a></p>
</dd>
</dl>

<a name="module_bfx-hf-algo"></a>

## bfx-hf-algo
This module implements an algorithmic order system using the Bitfinex
Node.JS API, and provides several official algo orders which serve as
reference implementations.

The system is exchange-agnostic and relies on external adapter libraries for
the actual exchange API connection. For bitfinex, this adapter is provided
by the [bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex) module.

### DB Backends

Algo order persistence is handled by the [bfx-hf-models](https://github.com/bitfinexcom/bfx-hf-models)
module, with supports multiple database backends. Currently two official
modules are provided:

* [bfx-hf-models-adapter-lowdb](https://github.com/bitfinexcom/bfx-hf-models-adapter-lowdb) for storage via `lowdb`
* [bfx-hf-models-adapter-sql](https://github.com/bitfinexcom/bfx-hf-models-adapter-sql) for storage via `knex`
  configured for `PostgreSQL`.

[bfx-hf-models-adapter-template](https://github.com/bitfinexcom/bfx-hf-models-adapter-template) provides an example of the
structure required to implement a custom database adapter.

### Exchange Interfaces

`bfx-hf-algo` is designed to work with any exchange through the use of
adapter modules, providing a common API for algorithmic order execution.

* [bfx-hf-ext-plugin-bitfinex](https://github.com/bitfinexcom/bfx-hf-ext-plugin-bitfinex) implements this API for
  [Bitfinex](https://bitfinex.com).
* [bfx-hf-ext-plugin-dummy](https://github.com/bitfinexcom/bfx-hf-ext-plugin-dummy) provides an example of the
  required structure.

**License**: Apache-2.0  
<a name="module_bfx-hf-algo/AccumulateDistribute"></a>

## bfx-hf-algo/AccumulateDistribute
Accumulate/Distribute allows you to break up a large order into smaller
randomized chunks, submitted at regular or irregular intervals to minimise
detection by other players in the market.

By enabling the 'Await Fill' option, the algorithm will ensure each
component fills before submitting subsequent orders. Enabling the 'Catch Up'
flag will cause the algorithm to ignore the slice interval for the next order
if previous orders have taken longer than expected to fill, thereby ensuring
the time-to-fill for the entire order is not adversely affected.

The price must be manually specified as `limitPrice` for `LIMIT` order types,
or as a combination of a price offset & cap for `RELATIVE` order types.
`MARKET` A/D orders execute using `MARKET` atomic orders, and offer no price
control.

For `RELATIVE` A/D orders, the price offset & cap can both be set to one of
the following:
* Top ask
* Top bid
* Orderbook mid price
* Last trade price
* Moving Average (configurable period, time frame, candle price)
* Exponential Moving Average (configurable period, time frame, candle price)

The period limit for moving average targets/caps is `240`, being the number
of candles returned by the Bitfinex API when subscribing to a candle data
channel.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> |  | symbol to trade on |
| amount | <code>number</code> |  | total order amount |
| sliceAmount | <code>number</code> |  | individual slice order amount |
| sliceInterval | <code>number</code> |  | delay in ms between slice orders |
| [intervalDistortion] | <code>number</code> | <code>0</code> | slice interval distortion in % |
| [amountDistortion] | <code>number</code> | <code>0</code> | slice amount distortion in % |
| orderType | <code>string</code> |  | LIMIT, MARKET, RELATIVE |
| [limitPrice] | <code>number</code> |  | price for LIMIT orders |
| catchUp | <code>boolean</code> |  | if true, interval will be ignored if behind with   filling slices |
| awaitFill | <code>boolean</code> |  | if true, slice orders will be kept open until   filled |
| [relativeOffset] | <code>object</code> |  | price reference for RELATIVE orders |
| [relativeOffset.type] | <code>string</code> |  | ask, bid, mid, last, ma, or ema |
| [relativeOffset.delta] | <code>number</code> |  | offset distance from price   reference |
| [relativeOffset.args] | <code>Array.&lt;number&gt;</code> |  | MA or EMA indicator arguments   [period] |
| [relativeOffset.candlePrice] | <code>string</code> |  | 'open', 'high', 'low',   'close' for MA or EMA indicators |
| [relativeOffset.candleTimeFrame] | <code>string</code> |  | '1m', '5m', '1D', etc,   for MA or EMA indicators |
| [relativeCap] | <code>object</code> |  | maximum price reference for RELATIVE orders |
| [relativeCap.type] | <code>string</code> |  | ask, bid, mid, last, ma, or ema |
| [relativeCap.delta] | <code>number</code> |  | cap distance from price reference |
| [relativeCap.args] | <code>Array.&lt;number&gt;</code> |  | MA or EMA indicator arguments   [period] |
| [relativeCap.candlePrice] | <code>string</code> |  | 'open', 'high', 'low', 'close'   for MA or EMA indicators |
| [relativeCap.candleTimeFrame] | <code>string</code> |  | '1m', '5m', '1D', etc, for   MA or EMA indicators |
| _margin | <code>boolean</code> |  | if false, order type is prefixed with EXCHANGE |

**Example**  
```js
await host.startAO('bfx-accumulate_distribute', {
  symbol: 'tBTCUSD',
  amount: -0.2,
  sliceAmount: -0.1,
  sliceInterval: 10000,
  intervalDistortion: 0.20, // %
  amountDistortion: 0.20, // %
  orderType: 'RELATIVE', // MARKET, LIMIT, RELATIVE
  offsetType: 'ask',
  offsetDelta: -10,
  capType: 'bid',
  capDelta: 10,
  submitDelay: 150,
  cancelDelay: 150,
  catchUp: true, // if true & behind, ignore slice interval (after prev fill)
  awaitFill: true, // await current slice fill before continuing to next slice
  _margin: false,
})
```

* [bfx-hf-algo/AccumulateDistribute](#module_bfx-hf-algo/AccumulateDistribute)
    * _static_
        * [.onDataManagedBook(instance, book, meta)](#module_bfx-hf-algo/AccumulateDistribute.onDataManagedBook) ⇒ <code>Promise</code>
        * [.onDataManagedCandles(instance, candles, meta)](#module_bfx-hf-algo/AccumulateDistribute.onDataManagedCandles) ⇒ <code>Promise</code>
        * [.onDataTrades(instance, trades, meta)](#module_bfx-hf-algo/AccumulateDistribute.onDataTrades) ⇒ <code>Promise</code>
        * [.onLifeStart(instance)](#module_bfx-hf-algo/AccumulateDistribute.onLifeStart) ⇒ <code>Promise</code>
        * [.onLifeStop(instance)](#module_bfx-hf-algo/AccumulateDistribute.onLifeStop) ⇒ <code>Promise</code>
        * [.onOrdersOrderCancel(instance, order)](#module_bfx-hf-algo/AccumulateDistribute.onOrdersOrderCancel) ⇒ <code>Promise</code>
        * [.onOrdersOrderFill(instance, order)](#module_bfx-hf-algo/AccumulateDistribute.onOrdersOrderFill) ⇒ <code>Promise</code>
        * [.onSelfIntervalTick(instance)](#module_bfx-hf-algo/AccumulateDistribute.onSelfIntervalTick) ⇒ <code>Promise</code>
        * [.onSelfSubmitOrder(instance)](#module_bfx-hf-algo/AccumulateDistribute.onSelfSubmitOrder) ⇒ <code>Promise</code>
        * [.declareChannels(instance, host)](#module_bfx-hf-algo/AccumulateDistribute.declareChannels) ⇒ <code>Promise</code>
        * [.declareEvents(instance, host)](#module_bfx-hf-algo/AccumulateDistribute.declareEvents)
        * [.genOrderLabel(state)](#module_bfx-hf-algo/AccumulateDistribute.genOrderLabel) ⇒ <code>string</code>
        * [.genPreview(args)](#module_bfx-hf-algo/AccumulateDistribute.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
        * [.getUIDef()](#module_bfx-hf-algo/AccumulateDistribute.getUIDef) ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
        * [.initState(args)](#module_bfx-hf-algo/AccumulateDistribute.initState) ⇒ <code>object</code>
        * [.processParams(data)](#module_bfx-hf-algo/AccumulateDistribute.processParams) ⇒ <code>object</code>
        * [.serialize(state)](#module_bfx-hf-algo/AccumulateDistribute.serialize) ⇒ <code>object</code>
        * [.unserialize(loadedState)](#module_bfx-hf-algo/AccumulateDistribute.unserialize) ⇒ <code>object</code>
        * [.validateParams(args)](#module_bfx-hf-algo/AccumulateDistribute.validateParams) ⇒ <code>string</code>
        * [.generateOrderAmounts(args)](#module_bfx-hf-algo/AccumulateDistribute.generateOrderAmounts) ⇒ <code>Array.&lt;number&gt;</code>
        * [.hasIndicatorCap(args)](#module_bfx-hf-algo/AccumulateDistribute.hasIndicatorCap) ⇒ <code>boolean</code>
        * [.hasIndicatorOffset(args)](#module_bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset) ⇒ <code>boolean</code>
        * [.hasOBRequirement(args)](#module_bfx-hf-algo/AccumulateDistribute.hasOBRequirement) ⇒ <code>boolean</code>
        * [.hasTradeRequirement(args)](#module_bfx-hf-algo/AccumulateDistribute.hasTradeRequirement) ⇒ <code>boolean</code>
        * [.scheduleTick(instance)](#module_bfx-hf-algo/AccumulateDistribute.scheduleTick) ⇒ <code>Promise</code>
    * _inner_
        * [~generateOrder](#module_bfx-hf-algo/AccumulateDistribute..generateOrder) ⇒ <code>Order</code>
        * ["selfSubmitOrder"](#module_bfx-hf-algo/AccumulateDistribute..event_selfSubmitOrder)
        * ["selfIntervalTick"](#module_bfx-hf-algo/AccumulateDistribute..event_selfIntervalTick)

<a name="module_bfx-hf-algo/AccumulateDistribute.onDataManagedBook"></a>

### bfx-hf-algo/AccumulateDistribute.onDataManagedBook(instance, book, meta) ⇒ <code>Promise</code>
Saves the book on the instance state if it is needed for order generation,
and it is for the configured symbol.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**See**: module:bfx-hf-algo/AccumulateDistribute.hasOBRequirement  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| book | <code>object</code> | order book model |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/AccumulateDistribute.onDataManagedCandles"></a>

### bfx-hf-algo/AccumulateDistribute.onDataManagedCandles(instance, candles, meta) ⇒ <code>Promise</code>
If the instance has internal indicators, they are either seeded with the
initial candle dataset or updated with new candles as they arrive. The
candle dataset is saved on the instance state for order generation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**

- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset
- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorCap


| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| candles | <code>Array.&lt;object&gt;</code> | array of incoming candles |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/AccumulateDistribute.onDataTrades"></a>

### bfx-hf-algo/AccumulateDistribute.onDataTrades(instance, trades, meta) ⇒ <code>Promise</code>
Saves the received trade on the instance state if it is needed for order
generation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**: module:bfx-hf-algo/AccumulateDistribute.hasTradeRequirement  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| trades | <code>Array.&lt;object&gt;</code> | array of incoming trades, only the most recent   is used. |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/AccumulateDistribute.onLifeStart"></a>

### bfx-hf-algo/AccumulateDistribute.onLifeStart(instance) ⇒ <code>Promise</code>
If needed, creates necessary indicators for price offset & cap calculation
and saves them on the instance state.

Schedules the first tick of `self:interval_tick`.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**

- module:bfx-hf-algo/AccumulateDistribute.onSelfIntervalTick
- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset
- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorCap


| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |

<a name="module_bfx-hf-algo/AccumulateDistribute.onLifeStop"></a>

### bfx-hf-algo/AccumulateDistribute.onLifeStop(instance) ⇒ <code>Promise</code>
Clears the tick timeout in preperation for teardown

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |

<a name="module_bfx-hf-algo/AccumulateDistribute.onOrdersOrderCancel"></a>

### bfx-hf-algo/AccumulateDistribute.onOrdersOrderCancel(instance, order) ⇒ <code>Promise</code>
Triggered on atomic order cancellation; clears the tick timeout and cancels
any remaining orders, before triggering the `exec:stop` event & teardown

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| order | <code>object</code> | the order that was cancelled externally |

<a name="module_bfx-hf-algo/AccumulateDistribute.onOrdersOrderFill"></a>

### bfx-hf-algo/AccumulateDistribute.onOrdersOrderFill(instance, order) ⇒ <code>Promise</code>
Called when an order fills. Updates the remaining amount & order timeline
position (if behind, etc) on the instance state. If the instance is fully
filled, the `exec:stop` event is triggered.

Otherwise, if `catchUp` is enabled and the instance is behind with order
fills the next tick is re-scheduled to occur earlier in order to compensate.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**: module:bfx-hf-algo/AccumulateDistribute.scheduleTick  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| order | <code>object</code> | the order that filled |

<a name="module_bfx-hf-algo/AccumulateDistribute.onSelfIntervalTick"></a>

### bfx-hf-algo/AccumulateDistribute.onSelfIntervalTick(instance) ⇒ <code>Promise</code>
Mapped to the `self:interval_tick` event and triggered by the instance
itself.

Schedules the next tick, and updates the orders-behind count on the instance
state if an order is currently open (meaning it has not filled in its
allocated window).

If `awaitFill` is `false`, the open order is cancelled and will be replaced
by the new order on the next tick. Otherwise nothing is done in order to
await a fill.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**Emits**: [<code>selfSubmitOrder</code>](#module_bfx-hf-algo/AccumulateDistribute..event_selfSubmitOrder)  
**See**: module:bfx-hf-algo/AccumulateDistribute.scheduleTick  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |

<a name="module_bfx-hf-algo/AccumulateDistribute.onSelfSubmitOrder"></a>

### bfx-hf-algo/AccumulateDistribute.onSelfSubmitOrder(instance) ⇒ <code>Promise</code>
Mapped to the `self:submit_order` event and triggered by the instance itself.

Generates an order and submits it if the necessary data was received for
price offset & cap calculation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**: module:bfx-hf-algo/AccumulateDistribute~generateOrder  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |

<a name="module_bfx-hf-algo/AccumulateDistribute.declareChannels"></a>

### bfx-hf-algo/AccumulateDistribute.declareChannels(instance, host) ⇒ <code>Promise</code>
Declares necessary data channels for price offset & cap calculations. The
instance may require a `trades` channel, `book` channel, or multiple `candle`
channels depending on the execution parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p  
**See**

- module:bfx-hf-algo/AccumulateDistribute.hasOBRequirement
- module:bfx-hf-algo/AccumulateDistribute.hasTradeRequirement
- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorCap
- module:bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset


| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for declaring channel requirements |

<a name="module_bfx-hf-algo/AccumulateDistribute.declareEvents"></a>

### bfx-hf-algo/AccumulateDistribute.declareEvents(instance, host)
Declares internal `self:submit_order` and `self:interval_tick` event
handlers to the host for event routing.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for event mapping |

<a name="module_bfx-hf-algo/AccumulateDistribute.genOrderLabel"></a>

### bfx-hf-algo/AccumulateDistribute.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for an AccumulateDistribute instance for rendering in an
UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.genPreview"></a>

### bfx-hf-algo/AccumulateDistribute.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Generates an array of preview orders which show what could be expected if
an instance of AccumulateDistribute was executed with the specified
parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Array.&lt;object&gt;</code> - previewOrders  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.getUIDef"></a>

### bfx-hf-algo/AccumulateDistribute.getUIDef() ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
Returns the UI layout definition for AccumulateDistribute, with a field for
each parameter.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: [<code>AOUIDefinition</code>](#AOUIDefinition) - uiDef  
<a name="module_bfx-hf-algo/AccumulateDistribute.initState"></a>

### bfx-hf-algo/AccumulateDistribute.initState(args) ⇒ <code>object</code>
Creates an initial state object for an AccumulateDistribute instance to
begin executing with. Generates randomized order amounts depending on the
execution parameters and resets the order timeline (orders behind, etc).

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>object</code> - initialState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.processParams"></a>

### bfx-hf-algo/AccumulateDistribute.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by an AccumulateDistribute instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/AccumulateDistribute.serialize"></a>

### bfx-hf-algo/AccumulateDistribute.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[module:bfx-hf-algo/AccumulateDistribute~unserialize](module:bfx-hf-algo/AccumulateDistribute~unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/AccumulateDistribute.unserialize"></a>

### bfx-hf-algo/AccumulateDistribute.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>object</code> - instanceState - ready for execution  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/AccumulateDistribute.validateParams"></a>

### bfx-hf-algo/AccumulateDistribute.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid AccumulateDistribute order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>object</code> |  | incoming parameters |
| args.amount | <code>number</code> |  | total order amount |
| args.sliceAmount | <code>number</code> |  | individual slice order amount |
| args.sliceInterval | <code>number</code> |  | delay in ms between slice orders |
| [args.intervalDistortion] | <code>number</code> | <code>0</code> | slice interval distortion in % |
| [args.amountDistortion] | <code>number</code> | <code>0</code> | slice amount distortion in % |
| args.orderType | <code>string</code> |  | LIMIT, MARKET, RELATIVE |
| [args.limitPrice] | <code>number</code> |  | price for LIMIT orders |
| args.catchUp | <code>boolean</code> |  | if true, interval will be ignored if behind   with filling slices |
| args.awaitFill | <code>boolean</code> |  | if true, slice orders will be kept open   until filled |
| [args.relativeOffset] | <code>object</code> |  | price reference for RELATIVE orders |
| [args.relativeOffset.type] | <code>string</code> |  | ask, bid, mid, last, ma, or ema |
| [args.relativeOffset.delta] | <code>number</code> |  | offset distance from price   reference |
| [args.relativeOffset.args] | <code>Array.&lt;number&gt;</code> |  | MA or EMA indicator arguments   [period] |
| [args.relativeOffset.candlePrice] | <code>string</code> |  | 'open', 'high', 'low',   'close' for MA or EMA indicators |
| [args.relativeOffset.candleTimeFrame] | <code>string</code> |  | '1m', '5m', '1D',   etc, for MA or EMA indicators |
| [args.relativeCap] | <code>object</code> |  | maximum price reference for RELATIVE   orders |
| [args.relativeCap.type] | <code>string</code> |  | ask, bid, mid, last, ma, or ema |
| [args.relativeCap.delta] | <code>number</code> |  | cap distance from price reference |
| [args.relativeCap.args] | <code>Array.&lt;number&gt;</code> |  | MA or EMA indicator arguments   [period] |
| [args.relativeCap.candlePrice] | <code>string</code> |  | 'open', 'high', 'low',   'close' for MA or EMA indicators |
| [args.relativeCap.candleTimeFrame] | <code>string</code> |  | '1m', '5m', '1D', etc,   for MA or EMA indicators |

<a name="module_bfx-hf-algo/AccumulateDistribute.generateOrderAmounts"></a>

### bfx-hf-algo/AccumulateDistribute.generateOrderAmounts(args) ⇒ <code>Array.&lt;number&gt;</code>
Generates an array of order slices which add up to the total configured
amount. Randomizes them if `amountDistortion` is finite and non-zero.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Array.&lt;number&gt;</code> - orderAmounts  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | order parameters |
| args.amount | <code>number</code> | total order amount |
| args.sliceAmount | <code>number</code> | individual slice amount |
| args.amountDistortion | <code>number</code> | desired distortion in % |

<a name="module_bfx-hf-algo/AccumulateDistribute.hasIndicatorCap"></a>

### bfx-hf-algo/AccumulateDistribute.hasIndicatorCap(args) ⇒ <code>boolean</code>
Utility function that checks if a set of execution parameters require an
indicator for price cap calculation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>boolean</code> - hasIndicatorCap  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset"></a>

### bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset(args) ⇒ <code>boolean</code>
Utility function that checks if a set of execution parameters require an
indicator for price offset calculation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>boolean</code> - hasIndicatorOffset  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.hasOBRequirement"></a>

### bfx-hf-algo/AccumulateDistribute.hasOBRequirement(args) ⇒ <code>boolean</code>
Utility function that checks if a set of execution parameters require order
book data for price cap or offset calculation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>boolean</code> - hasOBRequirement  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.hasTradeRequirement"></a>

### bfx-hf-algo/AccumulateDistribute.hasTradeRequirement(args) ⇒ <code>boolean</code>
Utility function that checks if a set of execution parameters require trade
data for price cap or offset calculation.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>boolean</code> - hasTradeRequirement  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/AccumulateDistribute.scheduleTick"></a>

### bfx-hf-algo/AccumulateDistribute.scheduleTick(instance) ⇒ <code>Promise</code>
Sets a timeout to emit the `self:interval_tick` event after the configured
slice interval passes, taking into account the configured interval
distortion for the AccumulateDistribute instance.

If `catchUp` was enabled and the instance is behind with order fills, the
next tick is always scheduled in 200ms.

**Kind**: static method of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**Emits**: <code>module:bfx-hf-algo/AccumulateDistribute.event:selfIntervalTick</code>  
**See**: module:bfx-hf-algo/AccumulateDistribute~onSelfIntervalTick  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/AccumulateDistribute..generateOrder"></a>

### bfx-hf-algo/AccumulateDistribute~generateOrder ⇒ <code>Order</code>
Generates an atomic order to fill one slice of an AccumulateDistribute
instance.

**Kind**: inner property of [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**Returns**: <code>Order</code> - o - null if awaiting data  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/AccumulateDistribute..event_selfSubmitOrder"></a>

### "selfSubmitOrder"
Triggers generation of the configured atomic slice, and submits it

**Kind**: event emitted by [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
**See**: module:bfx-hf-algo/AccumulateDistribute~generateOrder  
<a name="module_bfx-hf-algo/AccumulateDistribute..event_selfIntervalTick"></a>

### "selfIntervalTick"
Triggers verification of the price target, and a potential atomic order
submit.

**Kind**: event emitted by [<code>bfx-hf-algo/AccumulateDistribute</code>](#module_bfx-hf-algo/AccumulateDistribute)  
<a name="module_bfx-hf-algo/DefaultErrorHandlers"></a>

## bfx-hf-algo/DefaultErrorHandlers
Default error handlers attached to all algorithmic orders if no explicit
handlers are supplied.


* [bfx-hf-algo/DefaultErrorHandlers](#module_bfx-hf-algo/DefaultErrorHandlers)
    * [.onErrorInsufficientBalance(instance, order, notification)](#module_bfx-hf-algo/DefaultErrorHandlers.onErrorInsufficientBalance) ⇒ <code>Promise</code>
    * [.onErrorMinimumSize(instance, order, notification)](#module_bfx-hf-algo/DefaultErrorHandlers.onErrorMinimumSize) ⇒ <code>Promise</code>
    * [.onOrdersOrderError(instance)](#module_bfx-hf-algo/DefaultErrorHandlers.onOrdersOrderError) ⇒ <code>Promise</code>

<a name="module_bfx-hf-algo/DefaultErrorHandlers.onErrorInsufficientBalance"></a>

### bfx-hf-algo/DefaultErrorHandlers.onErrorInsufficientBalance(instance, order, notification) ⇒ <code>Promise</code>
Called when an insufficient balance notification is received. Emits an
`'exec:stop'` event and cancels all open orders after the teardown grace
period.

Mapped to the `error:insufficient_balance` event.

**Kind**: static method of [<code>bfx-hf-algo/DefaultErrorHandlers</code>](#module_bfx-hf-algo/DefaultErrorHandlers)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>object</code> | AO instance |
| order | <code>object</code> | order which is below the min size for its symbol |
| notification | <code>object</code> | incoming error notification |

<a name="module_bfx-hf-algo/DefaultErrorHandlers.onErrorMinimumSize"></a>

### bfx-hf-algo/DefaultErrorHandlers.onErrorMinimumSize(instance, order, notification) ⇒ <code>Promise</code>
Called when a minimum order size error is received. Emits an `'exec:stop'`
event and cancels all orders after the teardown grace period.

Mapped to the `error:minimum_size` event.

**Kind**: static method of [<code>bfx-hf-algo/DefaultErrorHandlers</code>](#module_bfx-hf-algo/DefaultErrorHandlers)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>object</code> | AO instance |
| order | <code>object</code> | order which is below the min size for its symbol |
| notification | <code>object</code> | barebones notification object from BFX |
| notification.text | <code>string</code> | original notification text |

<a name="module_bfx-hf-algo/DefaultErrorHandlers.onOrdersOrderError"></a>

### bfx-hf-algo/DefaultErrorHandlers.onOrdersOrderError(instance) ⇒ <code>Promise</code>
Called when a generic order error event is received. Emits an `'exec:stop'`
event and cancels open orders after the teardown grace period.

Mapped to the `orders:order_error` event.

**Kind**: static method of [<code>bfx-hf-algo/DefaultErrorHandlers</code>](#module_bfx-hf-algo/DefaultErrorHandlers)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>object</code> | AO instance |

<a name="module_bfx-hf-algo/Helpers"></a>

## bfx-hf-algo/Helpers
All algorithmic order event handlers receive the same arguments:
`(instance = {}, ...args)`. The instance contains two objects,
`{ state = {}, h = {} }` with `state` being the current AO state, and `h`
being a helper object.

The `h` helper object is an instance of this module bound to that specific
algorithmic order, providing methods for defining its own structure (custom
event names, required channels) and managing its lifecycle/execution.


* [bfx-hf-algo/Helpers](#module_bfx-hf-algo/Helpers)
    * [.clearAllTimeouts()](#module_bfx-hf-algo/Helpers.clearAllTimeouts)
    * [.debug(str, ...args)](#module_bfx-hf-algo/Helpers.debug)
    * [.emitSelf(eventName, ...eventArgs)](#module_bfx-hf-algo/Helpers.emitSelf) ⇒ <code>Promise</code>
    * [.emitSelfAsync(eventName, ...eventArgs)](#module_bfx-hf-algo/Helpers.emitSelfAsync) ⇒ <code>Promise</code>
    * [.emit(eventName, ...eventArgs)](#module_bfx-hf-algo/Helpers.emit) ⇒ <code>Promise</code>
    * [.emitAsync(eventName, ...eventArgs)](#module_bfx-hf-algo/Helpers.emitAsync) ⇒ <code>Promise</code>
    * [.notifyUI(level, message)](#module_bfx-hf-algo/Helpers.notifyUI) ⇒ <code>Promise</code>
    * [.cancelOrderWithDelay(state, delay, order)](#module_bfx-hf-algo/Helpers.cancelOrderWithDelay) ⇒ <code>object</code>
    * [.cancelAllOrdersWithDelay(state, delay)](#module_bfx-hf-algo/Helpers.cancelAllOrdersWithDelay) ⇒ <code>object</code>
    * [.submitOrderWithDelay(state, delay, order, attempt)](#module_bfx-hf-algo/Helpers.submitOrderWithDelay) ⇒ <code>object</code>
    * [.declareEvent(instance, aoHost, eventName, path)](#module_bfx-hf-algo/Helpers.declareEvent)
    * [.declareChannel(instance, aoHost, channel, filter)](#module_bfx-hf-algo/Helpers.declareChannel) ⇒ <code>object</code>
    * [.updateState(instance, update)](#module_bfx-hf-algo/Helpers.updateState) ⇒ <code>object</code>

<a name="module_bfx-hf-algo/Helpers.clearAllTimeouts"></a>

### bfx-hf-algo/Helpers.clearAllTimeouts()
Clear all timeouts for pending order submits/cancellations, called
automatically by the algo host on teardown.

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
<a name="module_bfx-hf-algo/Helpers.debug"></a>

### bfx-hf-algo/Helpers.debug(str, ...args)
Logs a string to the console, tagged by AO id/gid

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | format string |
| ...args | <code>string</code> \| <code>number</code> \| <code>object</code> \| <code>Array</code> | passed to debug() |

**Example**  
```js
debug('submitting order %s in %dms', order.toString(), delay)
```
<a name="module_bfx-hf-algo/Helpers.emitSelf"></a>

### bfx-hf-algo/Helpers.emitSelf(eventName, ...eventArgs) ⇒ <code>Promise</code>
Triggeres an event on the 'self' section

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>Promise</code> - p - resolves when all handlers complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | name of event to emit |
| ...eventArgs | <code>string</code> \| <code>number</code> \| <code>object</code> \| <code>Array</code> | args passed to all   handlers |

**Example**  
```js
await emitSelf('submit_orders')
```
<a name="module_bfx-hf-algo/Helpers.emitSelfAsync"></a>

### bfx-hf-algo/Helpers.emitSelfAsync(eventName, ...eventArgs) ⇒ <code>Promise</code>
Like `emitSelf` but operates after a timeout

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>Promise</code> - p - resolves when all handlers complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | name of event to emit |
| ...eventArgs | <code>string</code> \| <code>number</code> \| <code>object</code> \| <code>Array</code> | args passed to all   handlers |

**Example**  
```js
await emitSelfAsync('submit_orders')
```
<a name="module_bfx-hf-algo/Helpers.emit"></a>

### bfx-hf-algo/Helpers.emit(eventName, ...eventArgs) ⇒ <code>Promise</code>
Triggers a generic event

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>Promise</code> - p - resolves when all handlers complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | name of event to emit |
| ...eventArgs | <code>string</code> \| <code>number</code> \| <code>object</code> \| <code>Array</code> | args passed to all   handlers |

**Example**  
```js
await emit('exec:order:submit:all', gid, [order], submitDelay)
```
<a name="module_bfx-hf-algo/Helpers.emitAsync"></a>

### bfx-hf-algo/Helpers.emitAsync(eventName, ...eventArgs) ⇒ <code>Promise</code>
Like `emit` but operates after a timeout

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>Promise</code> - p - resolves when all handlers complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | name of event to emit |
| ...eventArgs | <code>string</code> \| <code>number</code> \| <code>object</code> \| <code>Array</code> | args passed to all   handlers |

**Example**  
```js
await emitAsync('exec:order:submit:all', gid, [order], submitDelay)
```
<a name="module_bfx-hf-algo/Helpers.notifyUI"></a>

### bfx-hf-algo/Helpers.notifyUI(level, message) ⇒ <code>Promise</code>
Triggers an UI notification, sent out via the active websocket connection

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>Promise</code> - p - resolves when all handlers complete  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>string</code> | 'info', 'success', 'error', 'warning' |
| message | <code>string</code> | notification content |

**Example**  
```js
await notifyUI('info', `Scheduled tick in ${delay}s`)
```
<a name="module_bfx-hf-algo/Helpers.cancelOrderWithDelay"></a>

### bfx-hf-algo/Helpers.cancelOrderWithDelay(state, delay, order) ⇒ <code>object</code>
Cancels the provided order after a delay, and removes it from the active
order set.

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>AOInstance</code>](#AOInstance) | current AO instance state |
| delay | <code>number</code> | in ms |
| order | <code>bfx-api-node-models.Order</code> \| <code>bfx-api-node-models.Order~Data</code> | order model or array |

**Example**  
```js
await cancelOrderWithDelay(state, 100, order)
```
<a name="module_bfx-hf-algo/Helpers.cancelAllOrdersWithDelay"></a>

### bfx-hf-algo/Helpers.cancelAllOrdersWithDelay(state, delay) ⇒ <code>object</code>
Cancels all orders currently on the AO state after the specified delay

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>AOInstance</code>](#AOInstance) | current AO instance state |
| delay | <code>number</code> | in ms |

**Example**  
```js
await cancelAllOrdersWithDelay(state, 100)
```
<a name="module_bfx-hf-algo/Helpers.submitOrderWithDelay"></a>

### bfx-hf-algo/Helpers.submitOrderWithDelay(state, delay, order, attempt) ⇒ <code>object</code>
Submits an order after a delay, and adds it to the active order set on
the AO state. Emits errors if the order fails to submit; retries up to
MAX_SUBMIT_ATTEMPTS in the case of balance evaluation errors.

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>AOInstance</code>](#AOInstance) | current AO instance state |
| delay | <code>number</code> | delay in milliseconds |
| order | <code>bfx-api-node-models.Order</code> | order model |
| attempt | <code>number</code> | attempt count, max is 10 (set as a constant) |

**Example**  
```js
await submitOrderWithDelay(state, 100, order)
```
<a name="module_bfx-hf-algo/Helpers.declareEvent"></a>

### bfx-hf-algo/Helpers.declareEvent(instance, aoHost, eventName, path)
Hooks up the listener for a new event on the 'self' section

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | ao instance |
| aoHost | [<code>AOHost</code>](#AOHost) | algo host instance |
| eventName | <code>string</code> | name of event to declare |
| path | <code>string</code> | on the 'self' section |

**Example**  
```js
declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
```
<a name="module_bfx-hf-algo/Helpers.declareChannel"></a>

### bfx-hf-algo/Helpers.declareChannel(instance, aoHost, channel, filter) ⇒ <code>object</code>
Assigns a data channel to the provided AO instance

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | ao instance |
| aoHost | [<code>AOHost</code>](#AOHost) | algo host instance |
| channel | <code>string</code> | channel name, i.e. 'ticker' |
| filter | <code>object</code> | channel spec, i.e. { symbol: 'tBTCUSD' } |

**Example**  
```js
await declareChannel(instance, host, 'trades', { symbol })
```
<a name="module_bfx-hf-algo/Helpers.updateState"></a>

### bfx-hf-algo/Helpers.updateState(instance, update) ⇒ <code>object</code>
Updates the state for the provided AO instance

**Kind**: static method of [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers)  
**Returns**: <code>object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | ao instance |
| update | <code>object</code> | new state |

**Example**  
```js
await updateState(instance, { remainingAmount })
```
<a name="module_bfx-hf-algo/Iceberg"></a>

## bfx-hf-algo/Iceberg
Iceberg allows you to place a large order on the market while ensuring only
a small part of it is ever filled at once. By enabling the 'Excess As Hidden'
option, it is possible to offer up the remainder as a hidden order, allowing
for minimal market disruption when executing large trades.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> |  | symbol to trade on |
| amount | <code>number</code> |  | total order amount |
| sliceAmount | <code>number</code> |  | iceberg slice order amount |
| [sliceAmountPerc] | <code>number</code> |  | , slice amount as % of total amount |
| excessAsHidden | <code>boolean</code> |  | whether to submit remainder as a hidden   order |
| orderType | <code>string</code> |  | LIMIT or MARKET |
| [submitDelay] | <code>number</code> | <code>1500</code> | in ms |
| [cancelDelay] | <code>number</code> | <code>5000</code> | in ms |
| [_margin] | <code>boolean</code> |  | if false, prefixes order type with EXCHANGE |

**Example**  
```js
await host.startAO('bfx-iceberg', {
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

* [bfx-hf-algo/Iceberg](#module_bfx-hf-algo/Iceberg)
    * _static_
        * [.generateOrders](#module_bfx-hf-algo/Iceberg.generateOrders) ⇒ <code>Array.&lt;object&gt;</code>
        * [.onLifeStart(instance)](#module_bfx-hf-algo/Iceberg.onLifeStart) ⇒ <code>Promise</code>
        * [.onLifeStop(instance)](#module_bfx-hf-algo/Iceberg.onLifeStop)
        * [.onOrdersOrderCancel(instance)](#module_bfx-hf-algo/Iceberg.onOrdersOrderCancel) ⇒ <code>Promise</code>
        * [.onOrdersOrderFill(instance, order)](#module_bfx-hf-algo/Iceberg.onOrdersOrderFill) ⇒ <code>Promise</code>
        * [.onSelfSubmitOrders(instance)](#module_bfx-hf-algo/Iceberg.onSelfSubmitOrders) ⇒ <code>Promise</code>
        * [.declareEvents(instance, host)](#module_bfx-hf-algo/Iceberg.declareEvents)
        * [.genOrderLabel(state)](#module_bfx-hf-algo/Iceberg.genOrderLabel) ⇒ <code>string</code>
        * [.genPreview(args)](#module_bfx-hf-algo/Iceberg.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
        * [.getUIDef()](#module_bfx-hf-algo/Iceberg.getUIDef) ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
        * [.initState(args)](#module_bfx-hf-algo/Iceberg.initState) ⇒ <code>object</code>
        * [.processParams(data)](#module_bfx-hf-algo/Iceberg.processParams) ⇒ <code>object</code>
        * [.serialize(state)](#module_bfx-hf-algo/Iceberg.serialize) ⇒ <code>object</code>
        * [.unserialize(loadedState)](#module_bfx-hf-algo/Iceberg.unserialize) ⇒ <code>object</code>
        * [.validateParams(args)](#module_bfx-hf-algo/Iceberg.validateParams) ⇒ <code>string</code>
        * [.genOrderLabel(state)](#module_bfx-hf-algo/Iceberg.genOrderLabel) ⇒ <code>string</code>
    * _inner_
        * ["event:selfSubmitOrders"](#module_bfx-hf-algo/Iceberg..event_selfSubmitOrders)

<a name="module_bfx-hf-algo/Iceberg.generateOrders"></a>

### bfx-hf-algo/Iceberg.generateOrders ⇒ <code>Array.&lt;object&gt;</code>
Returns an order set for the provided Iceberg instance, including a slice
order and the remaining amount as a hidden order if configured.

**Kind**: static property of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Array.&lt;object&gt;</code> - orders - order array  
**See**: module:bfx-hf-algo/Iceberg.onSelfSubmitOrders  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state |

<a name="module_bfx-hf-algo/Iceberg.onLifeStart"></a>

### bfx-hf-algo/Iceberg.onLifeStart(instance) ⇒ <code>Promise</code>
**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**Emits**: [<code>event:selfSubmitOrders</code>](#module_bfx-hf-algo/Iceberg..event_selfSubmitOrders)  
**See**: module:bfx-hf-algo/Iceberg.onSelfSubmitOrders  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/Iceberg.onLifeStop"></a>

### bfx-hf-algo/Iceberg.onLifeStop(instance)
Cancels any pending order submits prior to teardown

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/Iceberg.onOrdersOrderCancel"></a>

### bfx-hf-algo/Iceberg.onOrdersOrderCancel(instance) ⇒ <code>Promise</code>
Called when an atomic order cancellation is detected. Cancels any open
orders and emits the `'exec:stop'` event.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/Iceberg.onOrdersOrderFill"></a>

### bfx-hf-algo/Iceberg.onOrdersOrderFill(instance, order) ⇒ <code>Promise</code>
Called when an order is filled. Cancels any remaining open orders (slice or
excess), updates the remaining amount on the instance state, and submits
the next order set.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>bfx-api-node-models.Order</code> | order that filled |

<a name="module_bfx-hf-algo/Iceberg.onSelfSubmitOrders"></a>

### bfx-hf-algo/Iceberg.onSelfSubmitOrders(instance) ⇒ <code>Promise</code>
Submits the next slice order, and remaining amount as a hidden order if
configured.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**See**: module:bfx-hf-algo/Iceberg~generateOrders  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/Iceberg.declareEvents"></a>

### bfx-hf-algo/Iceberg.declareEvents(instance, host)
Declares internal `self:submit_orders` event handler to the host for event
routing.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for event mapping |

<a name="module_bfx-hf-algo/Iceberg.genOrderLabel"></a>

### bfx-hf-algo/Iceberg.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for an Iceberg instance for rendering in an UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/Iceberg.genPreview"></a>

### bfx-hf-algo/Iceberg.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Generates an array of preview orders which show what could be expected if
an instance of Iceberg was executed with the specified parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>Array.&lt;object&gt;</code> - previewOrders  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance parameters |

<a name="module_bfx-hf-algo/Iceberg.getUIDef"></a>

### bfx-hf-algo/Iceberg.getUIDef() ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
Returns the UI layout definition for Iceberg, with a field for each
parameter.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: [<code>AOUIDefinition</code>](#AOUIDefinition) - uiDef  
<a name="module_bfx-hf-algo/Iceberg.initState"></a>

### bfx-hf-algo/Iceberg.initState(args) ⇒ <code>object</code>
Creates an initial state object for an Iceberg instance to begin executing
with.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>object</code> - initialState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/Iceberg.processParams"></a>

### bfx-hf-algo/Iceberg.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by an Iceberg instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/Iceberg.serialize"></a>

### bfx-hf-algo/Iceberg.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[module:bfx-hf-algo/Iceberg~unserialize](module:bfx-hf-algo/Iceberg~unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/Iceberg.unserialize"></a>

### bfx-hf-algo/Iceberg.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>object</code> - instanceState - ready for execution  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/Iceberg.validateParams"></a>

### bfx-hf-algo/Iceberg.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid Icberg order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>object</code> |  | incoming parameters |
| args.amount | <code>number</code> |  | total order amount |
| args.sliceAmount | <code>number</code> |  | iceberg slice order amount |
| [args.sliceAmountPerc] | <code>number</code> |  | slice amount as % of total amount |
| args.excessAsHidden | <code>boolean</code> |  | whether to submit remainder as a   hidden order |
| args.orderType | <code>string</code> |  | LIMIT or MARKET |
| [args.submitDelay] | <code>number</code> | <code>1500</code> | in ms |
| [args.cancelDelay] | <code>number</code> | <code>5000</code> | in ms |

<a name="module_bfx-hf-algo/Iceberg.genOrderLabel"></a>

### bfx-hf-algo/Iceberg.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for an MACrossver instance for rendering in an UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/Iceberg..event_selfSubmitOrders"></a>

### "event:selfSubmitOrders"
Triggers order submit for both the slice and remainder if configured.

**Kind**: event emitted by [<code>bfx-hf-algo/Iceberg</code>](#module_bfx-hf-algo/Iceberg)  
<a name="module_bfx-hf-algo/MACrossover"></a>

## bfx-hf-algo/MACrossover
MA Crossover triggers either a `MARKET` or a `LIMIT` order when two
user-defined moving averages cross. Users can configure either a standard MA
or an EMA individually for both long & short signals.


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| orderType | <code>string</code> | LIMIT or MARKET |
| orderPrice | <code>number</code> | price for order if `orderType` is LIMIT |
| amount | <code>number</code> | total order amount |
| _margin | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |
| shortType | <code>string</code> | MA or EMA |
| [shortEMATF] | <code>string</code> | candle time frame for short EMA signal |
| [shortEMAPeriod] | <code>number</code> | cadnel period for short EMA signal |
| [shortEMAPrice] | <code>string</code> | candle price key for short EMA signal |
| [shortMATF] | <code>string</code> | candle time frame for short MA signal |
| shortMAPeriod | <code>number</code> | cadnel period for short MA signal |
| [shortMAPrice] | <code>string</code> | candle price key for short MA signal |
| longType | <code>string</code> | MA or EMA |
| [longEMATF] | <code>string</code> | candle time frame for long EMA signal |
| [longEMAPeriod] | <code>number</code> | cadnel period for long EMA signal |
| [longEMAPrice] | <code>string</code> | candle price key for long EMA signal |
| [longMATF] | <code>string</code> | candle time frame for long MA signal |
| [longMAPeriod] | <code>number</code> | cadnel period for long MA signal |
| [longMAPrice] | <code>string</code> | candle price key for long MA signal |

**Example**  
```js
await host.startAO('bfx-ma_crossover', {
  shortType: 'EMA',
  shortEMATF: '1m',
  shortEMAPeriod: '20',
  shortEMAPrice: 'close',
  longType: 'EMA',
  longEMATF: '1m',
  longEMAPeriod: '100',
  longEMAPrice: 'close',
  amount: 1,
  symbol: 'tEOSUSD',
  orderType: 'MARKET',
  action: 'Buy',
  _margin: false,
})
```

* [bfx-hf-algo/MACrossover](#module_bfx-hf-algo/MACrossover)
    * _static_
        * [.generateOrder](#module_bfx-hf-algo/MACrossover.generateOrder) ⇒ <code>object</code>
        * [.onDataManagedCandles(instance, candles, meta)](#module_bfx-hf-algo/MACrossover.onDataManagedCandles) ⇒ <code>Promise</code>
        * [.onLifeStop(instance)](#module_bfx-hf-algo/MACrossover.onLifeStop) ⇒ <code>Promise</code>
        * [.onOrdersOrderCancel(instance, order)](#module_bfx-hf-algo/MACrossover.onOrdersOrderCancel) ⇒ <code>Promise</code>
        * [.onSelfSubmitOrder(instance)](#module_bfx-hf-algo/MACrossover.onSelfSubmitOrder) ⇒ <code>Promise</code>
        * [.declareChannels(instance, host)](#module_bfx-hf-algo/MACrossover.declareChannels)
        * [.declareEvents(instance, host)](#module_bfx-hf-algo/MACrossover.declareEvents)
        * [.genPreview(args)](#module_bfx-hf-algo/MACrossover.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
        * [.initState(args)](#module_bfx-hf-algo/MACrossover.initState) ⇒ <code>object</code>
        * [.processParams(data)](#module_bfx-hf-algo/MACrossover.processParams) ⇒ <code>object</code>
        * [.serialize(state)](#module_bfx-hf-algo/MACrossover.serialize) ⇒ <code>object</code>
        * [.unserialize(loadedState)](#module_bfx-hf-algo/MACrossover.unserialize) ⇒ <code>object</code>
        * [.validateParams(args)](#module_bfx-hf-algo/MACrossover.validateParams) ⇒ <code>string</code>
    * _inner_
        * ["selfSubmitOrder"](#module_bfx-hf-algo/MACrossover..event_selfSubmitOrder)

<a name="module_bfx-hf-algo/MACrossover.generateOrder"></a>

### bfx-hf-algo/MACrossover.generateOrder ⇒ <code>object</code>
Generates the atomic order as configured in the execution parameters

**Kind**: static property of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>object</code> - order  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/MACrossover.onDataManagedCandles"></a>

### bfx-hf-algo/MACrossover.onDataManagedCandles(instance, candles, meta) ⇒ <code>Promise</code>
If the instance has internal indicators, they are either seeded with the
initial candle dataset or updated with new candles as they arrive. The
candle dataset is saved on the instance state for order generation.

Indicator values are calculated, and if they have crossed the configured
atomic order is submitted, and the `'exec:stop`' event is emitted to
stop execution and trigger teardown.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| candles | <code>Array.&lt;object&gt;</code> | incoming candles |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/MACrossover.onLifeStop"></a>

### bfx-hf-algo/MACrossover.onLifeStop(instance) ⇒ <code>Promise</code>
Stub to conform to the algo order schema.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/MACrossover.onOrdersOrderCancel"></a>

### bfx-hf-algo/MACrossover.onOrdersOrderCancel(instance, order) ⇒ <code>Promise</code>
Triggered when an atomic order cancellation is detected, cancels any open
orders and emits the `'exec:stop'` event.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>object</code> | order that was cancelled |

<a name="module_bfx-hf-algo/MACrossover.onSelfSubmitOrder"></a>

### bfx-hf-algo/MACrossover.onSelfSubmitOrder(instance) ⇒ <code>Promise</code>
Generates and submits the configured order.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/MACrossover.declareChannels"></a>

### bfx-hf-algo/MACrossover.declareChannels(instance, host)
Declares necessary candle data channels for updating indicators and
eventually triggering atomic order execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for declaring channel requirements |

<a name="module_bfx-hf-algo/MACrossover.declareEvents"></a>

### bfx-hf-algo/MACrossover.declareEvents(instance, host)
Declares the internal `self:submit_order` handler to the host for event
routing.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**See**: module:bfx-hf-algo/MACrossover.onSelfSubmitOrder  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for event mapping |

<a name="module_bfx-hf-algo/MACrossover.genPreview"></a>

### bfx-hf-algo/MACrossover.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Stub to conform to the algo order schema.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>Array.&lt;object&gt;</code> - preview  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance arguments |

<a name="module_bfx-hf-algo/MACrossover.initState"></a>

### bfx-hf-algo/MACrossover.initState(args) ⇒ <code>object</code>
Creates an initial state object for an MACrossover instance to begin
executing with.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>object</code> - initialState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/MACrossover.processParams"></a>

### bfx-hf-algo/MACrossover.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by an MACrossover instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/MACrossover.serialize"></a>

### bfx-hf-algo/MACrossover.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[module:bfx-hf-algo/MACrossover~unserialize](module:bfx-hf-algo/MACrossover~unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/MACrossover.unserialize"></a>

### bfx-hf-algo/MACrossover.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>object</code> - instanceState - ready for execution  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/MACrossover.validateParams"></a>

### bfx-hf-algo/MACrossover.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid MACrossover order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | incoming parameters |
| args.orderType | <code>string</code> | LIMIT or MARKET |
| args.orderPrice | <code>number</code> | price for order if `orderType` is LIMIT |
| args.amount | <code>number</code> | total order amount |
| args.shortType | <code>string</code> | MA or EMA |
| [args.shortEMATF] | <code>string</code> | candle time frame for short EMA signal |
| [args.shortEMAPeriod] | <code>number</code> | cadnel period for short EMA signal |
| [args.shortEMAPrice] | <code>string</code> | candle price key for short EMA signal |
| [args.shortMATF] | <code>string</code> | candle time frame for short MA signal |
| [args.shortMAPeriod] | <code>number</code> | cadnel period for short MA signal |
| [args.shortMAPrice] | <code>string</code> | candle price key for short MA signal |
| args.longType | <code>string</code> | MA or EMA |
| [args.longEMATF] | <code>string</code> | candle time frame for long EMA signal |
| [args.longEMAPeriod] | <code>number</code> | cadnel period for long EMA signal |
| [args.longEMAPrice] | <code>string</code> | candle price key for long EMA signal |
| [args.longMATF] | <code>string</code> | candle time frame for long MA signal |
| [args.longMAPeriod] | <code>number</code> | cadnel period for long MA signal |
| [args.longMAPrice] | <code>string</code> | candle price key for long MA signal |

<a name="module_bfx-hf-algo/MACrossover..event_selfSubmitOrder"></a>

### "selfSubmitOrder"
Triggers atomic order creation and teardown

**Kind**: event emitted by [<code>bfx-hf-algo/MACrossover</code>](#module_bfx-hf-algo/MACrossover)  
<a name="module_bfx-hf-algo/OCOCO"></a>

## bfx-hf-algo/OCOCO
Order Creates OCO (or OCOCO) triggers an OCO order after an initial MARKET
or LIMIT order fills.


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| orderType | <code>string</code> | initial order type, LIMIT or MARKET |
| orderPrice | <code>number</code> | price for initial order if `orderType` is LIMIT |
| amount | <code>number</code> | initial order amount |
| _margin | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |
| _futures | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |
| action | <code>string</code> | initial order direction, Buy or Sell |
| limitPrice | <code>number</code> | oco order limit price |
| stopPrice | <code>number</code> | oco order stop price |
| ocoAmount | <code>number</code> | oco order amount |
| ocoAction | <code>string</code> | oco order direction, Buy or Sell |
| submitDelaySec | <code>number</code> | submit delay in seconds |
| cancelDelaySec | <code>number</code> | cancel delay in seconds |
| lev | <code>number</code> | leverage for relevant markets |

**Example**  
```js
await host.startAO('bfx-ma_crossover', {
  symbol: 'tLEOUSD',
  orderType: 'LIMIT',
  orderPrice: 2,
  amount: 30,
  action: 'Sell',
  limitPrice: 1.7,
  stopPrice: 2.1,
  ocoAmount: 30,
  ocoAction: 'Buy',
  submitDelaySec: 0,
  cancelDelaySec: 0,
  margin: true
})
```

* [bfx-hf-algo/OCOCO](#module_bfx-hf-algo/OCOCO)
    * _static_
        * [.generateInitialOrder](#module_bfx-hf-algo/OCOCO.generateInitialOrder) ⇒ <code>object</code>
        * [.generateOCOOrder](#module_bfx-hf-algo/OCOCO.generateOCOOrder) ⇒ <code>object</code>
        * [.onLifeStart(instance)](#module_bfx-hf-algo/OCOCO.onLifeStart) ⇒ <code>Promise</code>
        * [.onLifeStop(instance)](#module_bfx-hf-algo/OCOCO.onLifeStop) ⇒ <code>Promise</code>
        * [.onOrdersOrderCancel(instance, order)](#module_bfx-hf-algo/OCOCO.onOrdersOrderCancel)
        * [.onOrdersOrderFill(instance, order)](#module_bfx-hf-algo/OCOCO.onOrdersOrderFill) ⇒ <code>Promise</code>
        * [.onSelfSubmitInitialOrder(instance)](#module_bfx-hf-algo/OCOCO.onSelfSubmitInitialOrder) ⇒ <code>Promise</code>
        * [.onSelfSubmitOCOOrder(instance)](#module_bfx-hf-algo/OCOCO.onSelfSubmitOCOOrder) ⇒ <code>Promise</code>
        * [.module.exports(instance, host)](#module_bfx-hf-algo/OCOCO.module.exports)
        * [.genOrderLabel(state)](#module_bfx-hf-algo/OCOCO.genOrderLabel) ⇒ <code>string</code>
        * [.genPreview(args)](#module_bfx-hf-algo/OCOCO.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
        * [.getUIDef()](#module_bfx-hf-algo/OCOCO.getUIDef) ⇒ <code>object</code>
        * [.initState(args)](#module_bfx-hf-algo/OCOCO.initState) ⇒ <code>object</code>
        * [.processParams(data)](#module_bfx-hf-algo/OCOCO.processParams) ⇒ <code>object</code>
        * [.serialize(state)](#module_bfx-hf-algo/OCOCO.serialize) ⇒ <code>object</code>
        * [.unserialize(loadedState)](#module_bfx-hf-algo/OCOCO.unserialize) ⇒ <code>object</code>
        * [.validateParams(args)](#module_bfx-hf-algo/OCOCO.validateParams) ⇒ <code>string</code>
    * _inner_
        * ["selfSubmitInitialOrder"](#module_bfx-hf-algo/OCOCO..event_selfSubmitInitialOrder)
        * ["selfSubmitOCOOrder"](#module_bfx-hf-algo/OCOCO..event_selfSubmitOCOOrder)

<a name="module_bfx-hf-algo/OCOCO.generateInitialOrder"></a>

### bfx-hf-algo/OCOCO.generateInitialOrder ⇒ <code>object</code>
Generates the initial atomic order as configured within the execution
parameters.

**Kind**: static property of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - order  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>module:bfx-hf-algo.AOInstance</code> | AO instance |

<a name="module_bfx-hf-algo/OCOCO.generateOCOOrder"></a>

### bfx-hf-algo/OCOCO.generateOCOOrder ⇒ <code>object</code>
Generates the OCO atomic order as configured within the execution
parameters.

**Kind**: static property of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - order  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>module:bfx-hf-algo.AOInstance</code> | AO instance |

<a name="module_bfx-hf-algo/OCOCO.onLifeStart"></a>

### bfx-hf-algo/OCOCO.onLifeStart(instance) ⇒ <code>Promise</code>
Submits the initial order as configured within the execution parameters

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**See**: module:bfx-hf-algo/OCOCO.onSelfSubmitInitialOrder  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/OCOCO.onLifeStop"></a>

### bfx-hf-algo/OCOCO.onLifeStop(instance) ⇒ <code>Promise</code>
Stub to conform to the algo order schema.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/OCOCO.onOrdersOrderCancel"></a>

### bfx-hf-algo/OCOCO.onOrdersOrderCancel(instance, order)
Triggered on atomic order cancellation; cancels any open orders and triggers
the `'exec:stop'` event & teardown.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| order | <code>object</code> | the order that was cancelled externally |

<a name="module_bfx-hf-algo/OCOCO.onOrdersOrderFill"></a>

### bfx-hf-algo/OCOCO.onOrdersOrderFill(instance, order) ⇒ <code>Promise</code>
Called on atomic order fill. If it was the initial order, the OCO order
is submitted, otherwise the `'exec:stop'` event is emitted to trigger
teardown.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>object</code> | the order that was filled |

<a name="module_bfx-hf-algo/OCOCO.onSelfSubmitInitialOrder"></a>

### bfx-hf-algo/OCOCO.onSelfSubmitInitialOrder(instance) ⇒ <code>Promise</code>
Generates and submits the initial atomic order as configured within the
execution parameters.

Mapped to the `'self:submit_initial_order'` event.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**See**: module:bfx-hf-algo/OCOCO.generateInitialOrder  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/OCOCO.onSelfSubmitOCOOrder"></a>

### bfx-hf-algo/OCOCO.onSelfSubmitOCOOrder(instance) ⇒ <code>Promise</code>
Generates and submits the OCO order as configured within the execution
parameters.

Mapped to the `'self:submit_oco_order'` event.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Promise</code> - p - resolves on completion  
**See**: module:bfx-hf-algo/OCOCO.generateOCOOrder  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/OCOCO.module.exports"></a>

### bfx-hf-algo/OCOCO.module.exports(instance, host)
Declares internal `self:submit_initial_order` and `self:self_submit_oco_order`
event handlers to the host for event routing.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | <code>object</code> | algo host instance for event mapping |

<a name="module_bfx-hf-algo/OCOCO.genOrderLabel"></a>

### bfx-hf-algo/OCOCO.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for an OCOCO instance for rendering in an UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/OCOCO.genPreview"></a>

### bfx-hf-algo/OCOCO.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Stub to conform to the algo order schema.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>Array.&lt;object&gt;</code> - preview  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance arguments |

<a name="module_bfx-hf-algo/OCOCO.getUIDef"></a>

### bfx-hf-algo/OCOCO.getUIDef() ⇒ <code>object</code>
Returns the UI layout definition for OCOCO, with a field for each parameter.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - uiDef  
<a name="module_bfx-hf-algo/OCOCO.initState"></a>

### bfx-hf-algo/OCOCO.initState(args) ⇒ <code>object</code>
Creates an initial state object for an OCOCO instance to begin executing with.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - initialState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/OCOCO.processParams"></a>

### bfx-hf-algo/OCOCO.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by an OCOCO instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/OCOCO.serialize"></a>

### bfx-hf-algo/OCOCO.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[module:bfx-hf-algo/OCOCO~unserialize](module:bfx-hf-algo/OCOCO~unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/OCOCO.unserialize"></a>

### bfx-hf-algo/OCOCO.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>object</code> - instanceState - ready for execution  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/OCOCO.validateParams"></a>

### bfx-hf-algo/OCOCO.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid OCOCO order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | incoming parameters |
| args.symbol | <code>string</code> | symbol to trade on |
| args.orderType | <code>string</code> | initial order type, LIMIT or MARKET |
| args.orderPrice | <code>number</code> | price for initial order if `orderType` is   LIMIT |
| args.amount | <code>number</code> | initial order amount |
| args.action | <code>string</code> | initial order direction, Buy or Sell |
| args.limitPrice | <code>number</code> | oco order limit price |
| args.stopPrice | <code>number</code> | oco order stop price |
| args.ocoAmount | <code>number</code> | oco order amount |
| args.ocoAction | <code>string</code> | oco order direction, Buy or Sell |
| args.submitDelaySec | <code>number</code> | submit delay in seconds |
| args.cancelDelaySec | <code>number</code> | cancel delay in seconds |

<a name="module_bfx-hf-algo/OCOCO..event_selfSubmitInitialOrder"></a>

### "selfSubmitInitialOrder"
Triggers the creation of the initial atomic order, as configured

**Kind**: event emitted by [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
<a name="module_bfx-hf-algo/OCOCO..event_selfSubmitOCOOrder"></a>

### "selfSubmitOCOOrder"
Triggers the creation of the OCO atomic order, as configured

**Kind**: event emitted by [<code>bfx-hf-algo/OCOCO</code>](#module_bfx-hf-algo/OCOCO)  
<a name="module_bfx-hf-algo/PingPong"></a>

## bfx-hf-algo/PingPong
Ping/pong submits multiple 'ping' orders; once a ping order fills, an
associated 'pong' order is submitted.

Multiple ping/pong pairs can be created by specifying an order count greater
than 1, a suitable min/max ping price, and a pong distance. Multiple ping
orders will be created between the specified min/max prices, with the
associated pongs offset by the pong distance from the ping price.

When operating in 'endless' mode, new ping orders will be submitted when
their associated pongs fill.


| Param | Type | Description |
| --- | --- | --- |
| endless | <code>boolean</code> | if enabled, pong fill will trigger a new ping |
| symbol | <code>string</code> | symbol to trade on |
| amount | <code>number</code> | individual ping/pong order amount |
| orderCount | <code>number</code> | number of ping/pong pairs to create, 1 or more |
| [pingPrice] | <code>number</code> | used for a single ping/pong pair |
| [pongPrice] | <code>number</code> | used for a single ping/pong pair |
| [pingMinPrice] | <code>number</code> | minimum price for ping orders |
| [pingMaxPrice] | <code>number</code> | maximum price for ping orders |
| [pongDistance] | <code>number</code> | pong offset from ping orders for multiple   pairs |

**Example**  
```js
await host.startAO('bfx-ping_pong', {
  symbol: 'tBTCUSD',
  amount: 0.5,
  orderCount: 5,
  pingMinPrice: 6000,
  pingMaxPrice: 6700,
  pongDistance: 300,
  submitDelay: 150,
  cancelDelay: 150,
  _margin: false,
})
```

* [bfx-hf-algo/PingPong](#module_bfx-hf-algo/PingPong)
    * [.genPingPongTable](#module_bfx-hf-algo/PingPong.genPingPongTable) ⇒ <code>object</code>
    * [.onLifeStart(instance)](#module_bfx-hf-algo/PingPong.onLifeStart) ⇒ <code>Promise</code>
    * [.onLifeStop(instance)](#module_bfx-hf-algo/PingPong.onLifeStop) ⇒ <code>Promise</code>
    * [.onOrdersOrderCancel(instance, order)](#module_bfx-hf-algo/PingPong.onOrdersOrderCancel) ⇒ <code>Promise</code>
    * [.onOrdersOrderFill(instance, order)](#module_bfx-hf-algo/PingPong.onOrdersOrderFill) ⇒ <code>Promise</code>
    * [.genOrderLabel(state)](#module_bfx-hf-algo/PingPong.genOrderLabel) ⇒ <code>string</code>
    * [.genPreview(args)](#module_bfx-hf-algo/PingPong.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
    * [.getUIDef()](#module_bfx-hf-algo/PingPong.getUIDef) ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
    * [.initState(args)](#module_bfx-hf-algo/PingPong.initState) ⇒ <code>object</code>
    * [.processParams(data)](#module_bfx-hf-algo/PingPong.processParams) ⇒ <code>object</code>
    * [.serialize(state)](#module_bfx-hf-algo/PingPong.serialize) ⇒ <code>object</code>
    * [.unserialize(loadedState)](#module_bfx-hf-algo/PingPong.unserialize) ⇒ <code>object</code>
    * [.validateParams(args)](#module_bfx-hf-algo/PingPong.validateParams) ⇒ <code>string</code>

<a name="module_bfx-hf-algo/PingPong.genPingPongTable"></a>

### bfx-hf-algo/PingPong.genPingPongTable ⇒ <code>object</code>
Generates a mapping between `ping` and `pong` prices as configured in the
execution parameters.

**Kind**: static property of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>object</code> - table  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | execution parameters |

<a name="module_bfx-hf-algo/PingPong.onLifeStart"></a>

### bfx-hf-algo/PingPong.onLifeStart(instance) ⇒ <code>Promise</code>
Generates and submits initial `ping` orders, along with any `pongs` that
need to be submitted due to the loaded execution state.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/PingPong.onLifeStop"></a>

### bfx-hf-algo/PingPong.onLifeStop(instance) ⇒ <code>Promise</code>
Cancels all open orders prior to teardown.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/PingPong.onOrdersOrderCancel"></a>

### bfx-hf-algo/PingPong.onOrdersOrderCancel(instance, order) ⇒ <code>Promise</code>
Triggered when an atomic order cancellation is detected, and cancels any
open orders before emitting an `exec:stop` event to trigger teardown.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>object</code> | the order that was cancelled |

<a name="module_bfx-hf-algo/PingPong.onOrdersOrderFill"></a>

### bfx-hf-algo/PingPong.onOrdersOrderFill(instance, order) ⇒ <code>Promise</code>
Triggered on atomic order fill. If it was a `ping`, the associated `pong`
is submitted. Otherwise it if was a `pong` and the instance was configured
as `endless`, the associated `ping` is submitted. If not `endless`, nothing
is done.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>object</code> | the order that filled |

<a name="module_bfx-hf-algo/PingPong.genOrderLabel"></a>

### bfx-hf-algo/PingPong.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for a PingPong instance for rendering in an UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/PingPong.genPreview"></a>

### bfx-hf-algo/PingPong.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Generates an array of preview orders which show what could be expected if
an instance of PingPong was executed with the specified parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>Array.&lt;object&gt;</code> - previewOrders  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance parameters |

<a name="module_bfx-hf-algo/PingPong.getUIDef"></a>

### bfx-hf-algo/PingPong.getUIDef() ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
Returns the UI layout definition for PingPong, with a field for each
parameter.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: [<code>AOUIDefinition</code>](#AOUIDefinition) - uiDef  
<a name="module_bfx-hf-algo/PingPong.initState"></a>

### bfx-hf-algo/PingPong.initState(args) ⇒ <code>object</code>
Creates an initial state object for PingPong instance to begin executing
with. Generates the ping-pong table price mapping.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>object</code> - initialState  
**See**: module:bfx-hf-algo/PingPong~genPingPongTable  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/PingPong.processParams"></a>

### bfx-hf-algo/PingPong.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by a PingPong instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/PingPong.serialize"></a>

### bfx-hf-algo/PingPong.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[module:bfx-hf-algo/PingPong~unserialize](module:bfx-hf-algo/PingPong~unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  
**See**: module:bfx-hf-algo/PingPong.unserialize  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/PingPong.unserialize"></a>

### bfx-hf-algo/PingPong.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>object</code> - instanceState - ready for execution  
**See**: module:bfx-hf-algo/PingPong.serialize  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/PingPong.validateParams"></a>

### bfx-hf-algo/PingPong.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid PingPong order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/PingPong</code>](#module_bfx-hf-algo/PingPong)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | incoming parameters |
| args.amount | <code>number</code> | individual ping/pong order amount |
| args.orderCount | <code>number</code> | number of ping/pong pairs to create, 1 or   more |
| [args.pingPrice] | <code>number</code> | used for a single ping/pong pair |
| [args.pongPrice] | <code>number</code> | used for a single ping/pong pair |
| [args.pingMinPrice] | <code>number</code> | minimum price for ping orders |
| [args.pingMaxPrice] | <code>number</code> | maximum price for ping orders |
| [args.pongDistance] | <code>number</code> | pong offset from ping orders for   multiple pairs |

<a name="module_bfx-hf-algo/TWAP"></a>

## bfx-hf-algo/TWAP
TWAP spreads an order out through time in order to fill at the time-weighted
average price, calculated between the time the order is submitted to the
final atomic order close.

The price can be specified as a fixed external target, such as the top
bid/ask or last trade price, or as an explicit target which must be matched
against the top bid/ask/last trade/etc.

Available price targets/explicit target conditions:
* OB side price (top bid/ask)
* OB mid price
* Last trade price


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> |  | symbol to trade on |
| amount | <code>number</code> |  | total order amount |
| sliceAmount | <code>number</code> |  | individual slice order amount |
| priceDelta | <code>number</code> |  | max acceptable distance from price target |
| [priceCondition] | <code>string</code> |  | MATCH_LAST, MATCH_SIDE, MATCH_MID |
| priceTarget | <code>number</code> \| <code>string</code> |  | numeric, or OB_SIDE, OB_MID, LAST |
| tradeBeyondEnd | <code>boolean</code> |  | if true, slices are not cancelled after   their interval expires |
| orderType | <code>string</code> |  | LIMIT or MARKET |
| _margin | <code>boolean</code> |  | if false, order type is prefixed with EXCHANGE |
| [submitDelay] | <code>number</code> | <code>1500</code> | in ms |
| [cancelDelay] | <code>number</code> | <code>5000</code> | in ms |

**Example**  
```js
await host.startAO('bfx-twap', {
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

* [bfx-hf-algo/TWAP](#module_bfx-hf-algo/TWAP)
    * _static_
        * [.onDataManagedBook(instance, book, meta)](#module_bfx-hf-algo/TWAP.onDataManagedBook)
        * [.onDataTrades(instance, trades, meta)](#module_bfx-hf-algo/TWAP.onDataTrades) ⇒ <code>Promise</code>
        * [.onLifeStart(instance)](#module_bfx-hf-algo/TWAP.onLifeStart) ⇒ <code>Promise</code>
        * [.onLifeStop(instance)](#module_bfx-hf-algo/TWAP.onLifeStop) ⇒ <code>Promise</code>
        * [.onOrdersOrderCancel(instance, order)](#module_bfx-hf-algo/TWAP.onOrdersOrderCancel) ⇒ <code>Promise</code>
        * [.onOrdersOrderFill(instance, order)](#module_bfx-hf-algo/TWAP.onOrdersOrderFill) ⇒ <code>Promise</code>
        * [.onSelfIntervalTick(instance)](#module_bfx-hf-algo/TWAP.onSelfIntervalTick) ⇒ <code>Promise</code>
        * [.declareChannels(instance, host)](#module_bfx-hf-algo/TWAP.declareChannels)
        * [.declareEvents(instance, host)](#module_bfx-hf-algo/TWAP.declareEvents)
        * [.genOrderLabel(state)](#module_bfx-hf-algo/TWAP.genOrderLabel) ⇒ <code>string</code>
        * [.genPreview(args)](#module_bfx-hf-algo/TWAP.genPreview) ⇒ <code>Array.&lt;object&gt;</code>
        * [.getUIDef()](#module_bfx-hf-algo/TWAP.getUIDef) ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
        * [.initState(args)](#module_bfx-hf-algo/TWAP.initState) ⇒ <code>object</code>
        * [.processParams(data)](#module_bfx-hf-algo/TWAP.processParams) ⇒ <code>object</code>
        * [.serialize(state)](#module_bfx-hf-algo/TWAP.serialize) ⇒ <code>object</code>
        * [.unserialize(loadedState)](#module_bfx-hf-algo/TWAP.unserialize) ⇒ <code>object</code>
        * [.validateParams(args)](#module_bfx-hf-algo/TWAP.validateParams) ⇒ <code>string</code>
    * _inner_
        * ["selfIntervalTick"](#module_bfx-hf-algo/TWAP..event_selfIntervalTick)

<a name="module_bfx-hf-algo/TWAP.onDataManagedBook"></a>

### bfx-hf-algo/TWAP.onDataManagedBook(instance, book, meta)
Saves the book on the instance state if it is needed for price target
matching, and it is for the configured symbol.

Mapped to the `data:managedBook` event.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**See**: module:bfx-hf-algo/TWAP.hasOBTarget  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| book | <code>bfx-api-node-models.OrderBook</code> | order book model |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/TWAP.onDataTrades"></a>

### bfx-hf-algo/TWAP.onDataTrades(instance, trades, meta) ⇒ <code>Promise</code>
Saves the last trade on the instance state to be used in price matching.

Mapped to the `data:trades` event.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| trades | <code>Array.&lt;object&gt;</code> | array of incoming trades |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="module_bfx-hf-algo/TWAP.onLifeStart"></a>

### bfx-hf-algo/TWAP.onLifeStart(instance) ⇒ <code>Promise</code>
Sets up the `self:interval_tick` interval and saves it on the state.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/TWAP.onLifeStop"></a>

### bfx-hf-algo/TWAP.onLifeStop(instance) ⇒ <code>Promise</code>
Clears the tick interval prior to teardown

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>object</code> | AO instance |

<a name="module_bfx-hf-algo/TWAP.onOrdersOrderCancel"></a>

### bfx-hf-algo/TWAP.onOrdersOrderCancel(instance, order) ⇒ <code>Promise</code>
Triggered when an atomic order cancellation is detected; cancels any open
orders and emits the `exec:stop` event to trigger teardown.

Mapped to the `orders:order_cancel` event.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>object</code> | AO instance |
| order | <code>object</code> | the order that was cancelled |

<a name="module_bfx-hf-algo/TWAP.onOrdersOrderFill"></a>

### bfx-hf-algo/TWAP.onOrdersOrderFill(instance, order) ⇒ <code>Promise</code>
Triggered when an atomic order fills. Updates the remaining amount on the
instance state, and emits the `exec:stop` if the instance is now fully
filled.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |
| order | <code>object</code> | the order that filled |

<a name="module_bfx-hf-algo/TWAP.onSelfIntervalTick"></a>

### bfx-hf-algo/TWAP.onSelfIntervalTick(instance) ⇒ <code>Promise</code>
Submits the next slice order if the price condition/target is met.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Promise</code> - p - resolves on completion  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance |

<a name="module_bfx-hf-algo/TWAP.declareChannels"></a>

### bfx-hf-algo/TWAP.declareChannels(instance, host)
Declares necessary data channels for price matching. The instance may
require a `book` or `trades` channel depending on the execution parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for declaring channel requirements |

<a name="module_bfx-hf-algo/TWAP.declareEvents"></a>

### bfx-hf-algo/TWAP.declareEvents(instance, host)
Declares internal `self:interval_tick` event handler to the host for event
routing.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  

| Param | Type | Description |
| --- | --- | --- |
| instance | [<code>AOInstance</code>](#AOInstance) | AO instance state |
| host | [<code>AOHost</code>](#AOHost) | algo host instance for event mapping |

<a name="module_bfx-hf-algo/TWAP.genOrderLabel"></a>

### bfx-hf-algo/TWAP.genOrderLabel(state) ⇒ <code>string</code>
Generates a label for a TWAP instance for rendering in an UI.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>string</code> - label  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | source instance state |
| state.args | <code>object</code> | source instance execution parameters |

<a name="module_bfx-hf-algo/TWAP.genPreview"></a>

### bfx-hf-algo/TWAP.genPreview(args) ⇒ <code>Array.&lt;object&gt;</code>
Generates an array of preview orders which show what could be expected if
an instance of TWAP was executed with the specified parameters.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>Array.&lt;object&gt;</code> - previewOrders  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance parameters |

<a name="module_bfx-hf-algo/TWAP.getUIDef"></a>

### bfx-hf-algo/TWAP.getUIDef() ⇒ [<code>AOUIDefinition</code>](#AOUIDefinition)
Returns the UI layout definition for TWAP, with a field for each parameter.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: [<code>AOUIDefinition</code>](#AOUIDefinition) - uiDef  
<a name="module_bfx-hf-algo/TWAP.initState"></a>

### bfx-hf-algo/TWAP.initState(args) ⇒ <code>object</code>
Creates an initial state object for a TWAP instance to begin executing with.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>object</code> - initialState  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | instance execution parameters |

<a name="module_bfx-hf-algo/TWAP.processParams"></a>

### bfx-hf-algo/TWAP.processParams(data) ⇒ <code>object</code>
Converts a raw parameters Object received from an UI into a parameters
Object which can be used by TWAP instance for execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>object</code> - parameters - ready to be passed to a fresh instance  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | raw parameters from an UI |

<a name="module_bfx-hf-algo/TWAP.serialize"></a>

### bfx-hf-algo/TWAP.serialize(state) ⇒ <code>object</code>
Creates a POJO from an instance's state which can be stored as JSON in a
database, and later loaded with the corresponding
[unserialize](#module_bfx-hf-algo/TWAP.unserialize) method.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>object</code> - pojo - DB-ready plain JS object  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | instance state to be serialized |

<a name="module_bfx-hf-algo/TWAP.unserialize"></a>

### bfx-hf-algo/TWAP.unserialize(loadedState) ⇒ <code>object</code>
Converts a loaded POJO into a state object ready for live execution.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>object</code> - instanceState - ready for execution  

| Param | Type | Description |
| --- | --- | --- |
| loadedState | <code>object</code> | data from a DB |

<a name="module_bfx-hf-algo/TWAP.validateParams"></a>

### bfx-hf-algo/TWAP.validateParams(args) ⇒ <code>string</code>
Verifies that a parameters Object is valid, and all parameters are within
the configured boundaries for a valid TWAP order.

Part of the `meta` handler section.

**Kind**: static method of [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
**Returns**: <code>string</code> - error - null if parameters are valid, otherwise a
  description of which parameter is invalid.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>object</code> |  | incoming parameters |
| args.amount | <code>number</code> |  | total order amount |
| args.sliceAmount | <code>number</code> |  | individual slice order amount |
| args.priceDelta | <code>number</code> |  | max acceptable distance from price target |
| [args.priceCondition] | <code>string</code> |  | MATCH_LAST, MATCH_SIDE, MATCH_MID |
| args.priceTarget | <code>number</code> \| <code>string</code> |  | numeric, or OB_SIDE, OB_MID, LAST |
| args.tradeBeyondEnd | <code>boolean</code> |  | if true, slices are not cancelled   after their interval expires |
| args.orderType | <code>string</code> |  | LIMIT or MARKET |
| [args.submitDelay] | <code>number</code> | <code>1500</code> | in ms |
| [args.cancelDelay] | <code>number</code> | <code>5000</code> | in ms |

<a name="module_bfx-hf-algo/TWAP..event_selfIntervalTick"></a>

### "selfIntervalTick"
Triggers price target comparison and a potential atomic order submit

**Kind**: event emitted by [<code>bfx-hf-algo/TWAP</code>](#module_bfx-hf-algo/TWAP)  
<a name="AOHost"></a>

## AOHost ⇐ [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)
The AOHost class provides a wrapper around the algo order system, and
manages lifetime events/order execution. Internally it hosts a Manager
instance from bfx-api-node-core for communication with the Bitfinex API, and
listens for websocket stream events in order to update order state/trigger
algo order events.

Execution is handled by an event system, with events being triggered by
Bitfinex API websocket stream payloads, and the algo orders themselves.

To start/stop algo orders, `gid = startAO(id, args)` and `stopAO(gid)`
methods are provided, with the generated group ID (`gid`) being the same as
that used for all atomic orders created by the individual algo orders.

**Kind**: global class  
**Extends**: [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  

* [AOHost](#AOHost) ⇐ [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)
    * [new AOHost([args])](#new_AOHost_new)
    * _instance_
        * [.getAdapter()](#AOHost+getAdapter) ⇒ <code>object</code>
        * [.reconnect()](#AOHost+reconnect)
        * [.close()](#AOHost+close) ⇒ <code>Promise</code>
        * [.connect()](#AOHost+connect)
        * [.getAOs()](#AOHost+getAOs) ⇒ <code>Array</code>
        * [.getAO(id)](#AOHost+getAO) ⇒ <code>object</code>
        * [.getAOInstance(gid)](#AOHost+getAOInstance) ⇒ <code>object</code>
        * [.getAOInstances()](#AOHost+getAOInstances) ⇒ [<code>Array.&lt;AOInstance&gt;</code>](#AOInstance)
        * [.reloadAllAOs()](#AOHost+reloadAllAOs)
        * [.loadAllAOs()](#AOHost+loadAllAOs)
        * [.startAO(id, [args], [gidCB])](#AOHost+startAO) ⇒ <code>string</code>
        * [.stopAO(gid)](#AOHost+stopAO)
        * [.aosRunning()](#AOHost+aosRunning) ⇒ <code>boolean</code>
        * [.removeAllListeners(matcher, negativeMatch)](#AsyncEventEmitter+removeAllListeners)
        * [.off(cb)](#AsyncEventEmitter+off)
        * [.once(matcher, cb)](#AsyncEventEmitter+once)
        * [.on(matcher, cb)](#AsyncEventEmitter+on)
        * [.onAll(cb)](#AsyncEventEmitter+onAll) ⇒ <code>Promise</code>
        * [.onAllOnce(cb)](#AsyncEventEmitter+onAllOnce) ⇒ <code>Promise</code>
        * [.emit(eventName, ...args)](#AsyncEventEmitter+emit) ⇒ <code>Promise</code>
    * _static_
        * [.TEARDOWN_GRACE_PERIOD_MS](#AOHost.TEARDOWN_GRACE_PERIOD_MS) : <code>number</code>
    * _inner_
        * ["dataNotification" (notification, meta)](#AOHost..event_dataNotification)
        * ["dataTicker" (ticker, meta)](#AOHost..event_dataTicker)
        * ["dataTrades" (update, meta)](#AOHost..event_dataTrades)
        * ["dataCandles" (update, AOHost~EventMetaInformation})](#AOHost..event_dataCandles)
        * ["dataBook" (update, meta)](#AOHost..event_dataBook)
        * ["dataManagedBook" (book, meta)](#AOHost..event_dataManagedBook)
        * ["dataManagedCandles" (candles, meta)](#AOHost..event_dataManagedCandles)
        * ["lifeStart"](#AOHost..event_lifeStart)
        * ["lifeStop"](#AOHost..event_lifeStop)
        * ["errorsInsufficientBalance" (order, notification)](#AOHost..event_errorsInsufficientBalance)
        * ["errorsMinimumSize" (order, notification)](#AOHost..event_errorsMinimumSize)
        * ["ordersOrderCancel" (order)](#AOHost..event_ordersOrderCancel)
        * ["ordersOrderFill" (order)](#AOHost..event_ordersOrderFill)
        * ["ordersOrderError" (order)](#AOHost..event_ordersOrderError)
        * [~EventMetaInformation](#AOHost..EventMetaInformation) : <code>object</code>

<a name="new_AOHost_new"></a>

### new AOHost([args])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args] | <code>object</code> |  | arguments |
| [args.db] | <code>object</code> |  | `bfx-hf-models` DB |
| [args.wsURL] | <code>string</code> | <code>&quot;&#x27;wss://api.bitfinex.com/ws/2&#x27;&quot;</code> | WS endpoint |
| [args.restURL] | <code>string</code> | <code>&quot;&#x27;https://api.bitfinex.com&#x27;&quot;</code> | REST endpoint |
| [args.agent] | <code>object</code> |  | proxy agent |
| [args.aos] | <code>Array.&lt;object&gt;</code> |  | algo orders to manage |
| [args.dms] | <code>number</code> | <code>4</code> | dead man switch, active 4 |

<a name="AOHost+getAdapter"></a>

### aoHost.getAdapter() ⇒ <code>object</code>
Get configured exchange adapter

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>object</code> - adapter  
<a name="AOHost+reconnect"></a>

### aoHost.reconnect()
Disconnect & reconnect the exchange adapter

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+close"></a>

### aoHost.close() ⇒ <code>Promise</code>
Close the exchange adapter connection.

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>Promise</code> - p - resolves on connection close  
<a name="AOHost+connect"></a>

### aoHost.connect()
Opens a new socket connection on the internal adapter

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+getAOs"></a>

### aoHost.getAOs() ⇒ <code>Array</code>
Fetch configured algorithmic orders

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>Array</code> - aos  
<a name="AOHost+getAO"></a>

### aoHost.getAO(id) ⇒ <code>object</code>
Returns the algo order definition identified by the provided ID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>object</code> - aoDef  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | i.e. bfx-iceberg |

<a name="AOHost+getAOInstance"></a>

### aoHost.getAOInstance(gid) ⇒ <code>object</code>
Returns the active AO instance state identified by the provided GID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>object</code> - state - algo order state  

| Param | Type | Description |
| --- | --- | --- |
| gid | <code>string</code> | algo order group ID |

<a name="AOHost+getAOInstances"></a>

### aoHost.getAOInstances() ⇒ [<code>Array.&lt;AOInstance&gt;</code>](#AOInstance)
Returns an array of all running algo order instances

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: [<code>Array.&lt;AOInstance&gt;</code>](#AOInstance) - aoInstances  
<a name="AOHost+reloadAllAOs"></a>

### aoHost.reloadAllAOs()
Implodes all current AO instances, but does NOT stop them. Afterwards, all
known AOs are loaded and started again.

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+loadAllAOs"></a>

### aoHost.loadAllAOs()
Loads and starts all saved previously active algo orders

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+startAO"></a>

### aoHost.startAO(id, [args], [gidCB]) ⇒ <code>string</code>
Creates and starts a new algo order instance, based on the AO def
identified by the supplied ID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>string</code> - gid - instance GID  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | algo order definition ID, i.e. bfx-iceberg |
| [args] | <code>object</code> | <code>{}</code> | algo order arguments/parameters |
| [gidCB] | <code>function</code> |  | callback to acquire GID prior to ao:start |

<a name="AOHost+stopAO"></a>

### aoHost.stopAO(gid)
Stops an algo order instance by GID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| gid | <code>string</code> | algo order instance GID |

<a name="AOHost+aosRunning"></a>

### aoHost.aosRunning() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>boolean</code> - aosRunning - true if any algo order is currently
  running  
<a name="AsyncEventEmitter+removeAllListeners"></a>

### aoHost.removeAllListeners(matcher, negativeMatch)
Removes all listeners, only those for the specified event name, or those
matching/not matching a regular expression

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>removeAllListeners</code>](#AsyncEventEmitter+removeAllListeners)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| negativeMatch | <code>boolean</code> | if true, events not matching are deleted |

<a name="AsyncEventEmitter+off"></a>

### aoHost.off(cb)
Remove an event handler by event name

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>off</code>](#AsyncEventEmitter+off)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+once"></a>

### aoHost.once(matcher, cb)
Bind an event handler that should only fire once

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>once</code>](#AsyncEventEmitter+once)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+on"></a>

### aoHost.on(matcher, cb)
Bind an event handler

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>on</code>](#AsyncEventEmitter+on)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+onAll"></a>

### aoHost.onAll(cb) ⇒ <code>Promise</code>
Bind an event handler for all event types

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>onAll</code>](#AsyncEventEmitter+onAll)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+onAllOnce"></a>

### aoHost.onAllOnce(cb) ⇒ <code>Promise</code>
Bind an event handler for all event types that only fires once

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>onAllOnce</code>](#AsyncEventEmitter+onAllOnce)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+emit"></a>

### aoHost.emit(eventName, ...args) ⇒ <code>Promise</code>
Emit an event; can be await'ed, and will resolve after all handlers have
been called

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Overrides**: [<code>emit</code>](#AsyncEventEmitter+emit)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | event name to emit |
| ...args | <code>object</code> \| <code>Array</code> \| <code>string</code> \| <code>number</code> | arguments to pass to   listeners |

<a name="AOHost.TEARDOWN_GRACE_PERIOD_MS"></a>

### AOHost.TEARDOWN\_GRACE\_PERIOD\_MS : <code>number</code>
How long orders are allowed to settle for before teardown in ms.

**Kind**: static constant of [<code>AOHost</code>](#AOHost)  
**Read only**: true  
<a name="AOHost..event_dataNotification"></a>

### "dataNotification" (notification, meta)
Triggered when a notification is received.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>Array.&lt;Array&gt;</code> | incoming notification data |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_dataTicker"></a>

### "dataTicker" (ticker, meta)
Triggered when a ticker is received.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| ticker | <code>Array.&lt;Array&gt;</code> | incoming ticker data |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_dataTrades"></a>

### "dataTrades" (update, meta)
Triggered when a trade snapshot or single trade is received

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>Array.&lt;Array&gt;</code> | incoming snapshot or single trade |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_dataCandles"></a>

### "dataCandles" (update, AOHost~EventMetaInformation})
Triggered when a candle snapshot or individual candle is received.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>Array.&lt;Array&gt;</code> | incoming snapshot or single candle |
| AOHost~EventMetaInformation} |  | meta - source channel information |

<a name="AOHost..event_dataBook"></a>

### "dataBook" (update, meta)
Triggered when an order book update is received.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>Array.&lt;Array&gt;</code> | incoming snapshot or price level |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_dataManagedBook"></a>

### "dataManagedBook" (book, meta)
Triggered when an order book update is received, and an internally
managed order book instance is updated. The entire order book is passed
to the event listeners.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| book | <code>object</code> | full order boook |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_dataManagedCandles"></a>

### "dataManagedCandles" (candles, meta)
Triggered when a candle update is received, and an internally managed
candle dataset is updated. The entire dataset is passed to the event
listeners.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| candles | <code>Array.&lt;object&gt;</code> | full dataset |
| meta | [<code>EventMetaInformation</code>](#AOHost..EventMetaInformation) | source channel information |

<a name="AOHost..event_lifeStart"></a>

### "lifeStart"
Triggered when an algorithmic order begins execution.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  
<a name="AOHost..event_lifeStop"></a>

### "lifeStop"
Triggered when an algorithmic order ends execution.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  
<a name="AOHost..event_errorsInsufficientBalance"></a>

### "errorsInsufficientBalance" (order, notification)
Triggered when an order fails due to have insufficient balance

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>bfx-api-node-models.Order</code> | the order that failed |
| notification | <code>bfx-api-node-models.Notification</code> | the incoming   notification |

<a name="AOHost..event_errorsMinimumSize"></a>

### "errorsMinimumSize" (order, notification)
Triggered when an order fails due to being below the minimum size for that
market.

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>bfx-api-node-models.Order</code> | the order that failed |
| notification | <code>bfx-api-node-models.Notification</code> | the incoming   notification |

<a name="AOHost..event_ordersOrderCancel"></a>

### "ordersOrderCancel" (order)
Triggered on atomic order cancellation

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>object</code> | the order that was cancelled |

<a name="AOHost..event_ordersOrderFill"></a>

### "ordersOrderFill" (order)
Triggered on atomic order fill

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>object</code> | the order that was filled |

<a name="AOHost..event_ordersOrderError"></a>

### "ordersOrderError" (order)
Triggered on a generic order error

**Kind**: event emitted by [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| order | <code>object</code> | the order that caused the error |

<a name="AOHost..EventMetaInformation"></a>

### AOHost~EventMetaInformation : <code>object</code>
**Kind**: inner typedef of [<code>AOHost</code>](#AOHost)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| chanFilter | <code>object</code> | source channel filter |
| chanFilter.symbol | <code>string</code> | source channel symbol |

<a name="AsyncEventEmitter"></a>

## AsyncEventEmitter
Event emitter class that provides an async `emit` function, useful for when
one needs to `await` the event and all of its listeners.

**Kind**: global class  

* [AsyncEventEmitter](#AsyncEventEmitter)
    * [.removeAllListeners(matcher, negativeMatch)](#AsyncEventEmitter+removeAllListeners)
    * [.off(cb)](#AsyncEventEmitter+off)
    * [.once(matcher, cb)](#AsyncEventEmitter+once)
    * [.on(matcher, cb)](#AsyncEventEmitter+on)
    * [.onAll(cb)](#AsyncEventEmitter+onAll) ⇒ <code>Promise</code>
    * [.onAllOnce(cb)](#AsyncEventEmitter+onAllOnce) ⇒ <code>Promise</code>
    * [.emit(eventName, ...args)](#AsyncEventEmitter+emit) ⇒ <code>Promise</code>

<a name="AsyncEventEmitter+removeAllListeners"></a>

### asyncEventEmitter.removeAllListeners(matcher, negativeMatch)
Removes all listeners, only those for the specified event name, or those
matching/not matching a regular expression

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| negativeMatch | <code>boolean</code> | if true, events not matching are deleted |

<a name="AsyncEventEmitter+off"></a>

### asyncEventEmitter.off(cb)
Remove an event handler by event name

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+once"></a>

### asyncEventEmitter.once(matcher, cb)
Bind an event handler that should only fire once

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+on"></a>

### asyncEventEmitter.on(matcher, cb)
Bind an event handler

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>string</code> \| <code>RegExp</code> | regular expression or string to match   with |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+onAll"></a>

### asyncEventEmitter.onAll(cb) ⇒ <code>Promise</code>
Bind an event handler for all event types

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+onAllOnce"></a>

### asyncEventEmitter.onAllOnce(cb) ⇒ <code>Promise</code>
Bind an event handler for all event types that only fires once

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | callback |

<a name="AsyncEventEmitter+emit"></a>

### asyncEventEmitter.emit(eventName, ...args) ⇒ <code>Promise</code>
Emit an event; can be await'ed, and will resolve after all handlers have
been called

**Kind**: instance method of [<code>AsyncEventEmitter</code>](#AsyncEventEmitter)  
**Returns**: <code>Promise</code> - p - resolves when all listeners complete  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | event name to emit |
| ...args | <code>object</code> \| <code>Array</code> \| <code>string</code> \| <code>number</code> | arguments to pass to   listeners |

<a name="defineAlgoOrder"></a>

## defineAlgoOrder(definition) ⇒ <code>object</code>
Attaches default handlers if not supplied & returns the algo order definition

**Kind**: global function  
**Returns**: <code>object</code> - ao  

| Param | Type | Description |
| --- | --- | --- |
| definition | <code>object</code> | algorithmic order definition |

<a name="AOInstance"></a>

## AOInstance : <code>object</code>
An object containing all state for an algorithmic order instance. Includes
the [AsyncEventEmitter](#AsyncEventEmitter) instance used to trigger internal order logic.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| h | [<code>bfx-hf-algo/Helpers</code>](#module_bfx-hf-algo/Helpers) | helpers bound to the instance |
| state | <code>object</code> | instance state used during execution |
| state.id | <code>number</code> | ID of the instance |
| state.gid | <code>number</code> | ID of the order group, attached to all   orders |
| state.channels | <code>Array</code> | subscribed channels and their filters |
| state.orders | <code>object</code> | map of open orders key'd by client ID |
| state.cancelledOrders | <code>object</code> | map of cancelled orders key'd   by client ID |
| state.allOrders | <code>object</code> | map of all orders ever created by   the instance key'd by client ID |
| state.connection | <code>object</code> | object passed to exchange adapter   for all API interactions. Contents vary based on the adapter in use. |
| state.ev | [<code>AsyncEventEmitter</code>](#AsyncEventEmitter) | internal event emitter |

<a name="AOUIDefinition"></a>

## AOUIDefinition : <code>object</code>
Object describing the layout and components of the submission form presented
to the user for an individual algorithmic order. For examples, refer to any
of the algorithmic orders provided by [bfx-hf-algo](#module_bfx-hf-algo)

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| label | <code>string</code> | name of the order to be shown to the user |
| id | <code>string</code> | internal algorithmic order ID |
| [uiIcon] | <code>string</code> | CSS classname of the icon to show |
| [customHelp] | <code>string</code> | documentation |
| connectionTimeout | <code>number</code> | how long to wait before considering   the HF disconnected |
| actionTimeout | <code>number</code> | how long to wait for action confirmatio   before considering the HF disconnected |
| [header] | <code>object</code> | rendered at the top of the form |
| [header.component] | <code>string</code> | component to use for the header |
| [header.fields] | <code>Array.&lt;string&gt;</code> | array of field names to render in   header |
| sections | <code>Array.&lt;object&gt;</code> | the layout definition itself |
| sections[].title | <code>string</code> | rendered above the section |
| sections[].name | <code>string</code> | unique internal ID for the section |
| sections[].rows | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | array of rows of field IDs to   render in the section, two per row. |
| fields | <code>object</code> | field definitions, key'd by ID |
| actions | <code>Array.&lt;string&gt;</code> | array of action names, maximum 2 |

