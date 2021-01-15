# Algo Orders Description

## TOC

 - [Accumulate/Distribute](#ad)
 - [Iceberg](#iceberg)
 - [MA Crossover](#macross)
 - [Order Creates OCO](#ococo)
 - [Ping/Pong](#pingpong)
 - [TWAP](#twap)

## Accumulate/Distribute

<a id="ad" />
Accumulate/Distribute allows you to break up a large order into smaller
randomized chunks, submitted at regular or irregular intervals to minimise
detection by other players in the market.
<br/>
<br/>
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

  - Top ask
  - Top bid
  - Orderbook mid price
  - Last trade price
  - Moving Average (configurable period, time frame, candle price)
  - Exponential Moving Average (configurable period, time frame, candle price)

The period limit for moving average targets/caps is `240`, being the number
of candles returned by the Bitfinex API when subscribing to a candle data
channel.


## Iceberg

<a id="iceberg" />
Iceberg allows you to place a large order on the market while ensuring only
a small part of it is ever filled at once. By enabling the 'Excess As Hidden'
option, it is possible to offer up the remainder as a hidden order, allowing
for minimal market disruption when executing large trades.


## MA Crossover

<a id="macross" />
MA Crossover triggers either a `MARKET` or a `LIMIT` order when two
user-defined moving averages cross. Users can configure either a standard MA
or an EMA individually for both long & short signals.

## Order Creates OCO

<a id="ococo" />
Order Creates OCO (or OCOCO) triggers an OCO order after an initial MARKET
or LIMIT order fills.

## Ping/Pong

<a id="pingpong" />
Ping/Pong submits multiple 'ping' orders; once a ping order fills, an
associated 'pong' order is submitted.
<br/>
<br/>
Multiple ping/pong pairs can be created by specifying an order count greater
than 1, a suitable min/max ping price, and a pong distance. Multiple ping
orders will be created between the specified min/max prices, with the
associated pongs offset by the pong distance from the ping price.
<br/>
<br/>
When operating in 'endless' mode, new ping orders will be submitted when
their associated pongs fill.

## TWAP

<a id="twap" />
TWAP spreads an order out through time in order to fill at the time-weighted
average price, calculated between the time the order is submitted to the
final atomic order close.
<br/>
<br/>
The price can be specified as a fixed external target, such as the top
bid/ask or last trade price, or as an explicit target which must be matched
against the top bid/ask/last trade/etc.

Available price targets/explicit target conditions:
  - OB side price (top bid/ask)
  - OB mid price
  - Last trade price
