<a name="OCOCO"></a>

## OCOCO
Order Creates OCO (or OCOCO) triggers an OCO order after an initial MARKET
or LIMIT order fills.

**Kind**: global variable  

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

