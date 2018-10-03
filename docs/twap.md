<a name="TWAP"></a>

## TWAP
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

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| amount | <code>number</code> | total order amount |
| sliceAmount | <code>number</code> | individual slice order amount |
| priceDelta | <code>number</code> | max acceptable distance from price target |
| priceCondition | <code>string</code> | MATCH_LAST, MATCH_SIDE, MATCH_MID |
| priceTarget | <code>number</code> \| <code>string</code> | numeric, or OB_SIDE, OB_MID, LAST |
| tradeBeyondEnd | <code>boolean</code> | if true, slices are not cancelled after their interval expires |
| orderType | <code>string</code> | LIMIT or MARKET |
| _margin | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |
| submitDelay | <code>number</code> | in ms, defaults to 1500 |
| cancelDelay | <code>number</code> | in ms, defaults to 5000 |

