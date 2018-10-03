<a name="Accumulate/Distribute"></a>

## Accumulate/Distribute
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

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| amount | <code>number</code> | total order amount |
| sliceAmount | <code>number</code> | individual slice order amount |
| sliceInterval | <code>number</code> | delay in ms between slice orders |
| intervalDistortion | <code>number</code> | slice interval distortion in %, default 0 |
| amountDistortion | <code>number</code> | slice amount distortion in %, default 0 |
| orderType | <code>string</code> | LIMIT, MARKET, RELATIVE |
| limitPrice | <code>number</code> | price for LIMIT orders |
| catchUp | <code>boolean</code> | if true, interval will be ignored if behind with filling slices |
| awaitFill | <code>boolean</code> | if true, slice orders will be kept open until filled |
| relativeOffset | <code>Object</code> | price reference for RELATIVE orders |
| relativeOffset.type | <code>string</code> | ask, bid, mid, last, ma, or ema |
| relativeOffset.delta | <code>number</code> | offset distance from price reference |
| relativeOffset.args | <code>Array.&lt;number&gt;</code> | MA or EMA indicator arguments [period] |
| relativeOffset.candlePrice | <code>string</code> | 'open', 'high', 'low', 'close' for MA or EMA indicators |
| relativeOffset.candleTimeFrame | <code>string</code> | '1m', '5m', '1D', etc, for MA or EMA indicators |
| relativeCap | <code>Object</code> | maximum price reference for RELATIVE orders |
| relativeCap.type | <code>string</code> | ask, bid, mid, last, ma, or ema |
| relativeCap.delta | <code>number</code> | cap distance from price reference |
| relativeCap.args | <code>Array.&lt;number&gt;</code> | MA or EMA indicator arguments [period] |
| relativeCap.candlePrice | <code>string</code> | 'open', 'high', 'low', 'close' for MA or EMA indicators |
| relativeCap.candleTimeFrame | <code>string</code> | '1m', '5m', '1D', etc, for MA or EMA indicators |
| _margin | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |

