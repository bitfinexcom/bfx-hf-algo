<a name="Iceberg"></a>

## Iceberg
Iceberg allows you to place a large order on the market while ensuring only
a small part of it is ever filled at once. By enabling the 'Excess As Hidden'
option, it is possible to offer up the remainder as a hidden order, allowing
for minimal market disruption when executing large trades.

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| amount | <code>number</code> | total order amount |
| sliceAmount | <code>number</code> | iceberg slice order amount |
| sliceAmountPerc | <code>number</code> | optional, slice amount as % of total amount |
| excessAsHidden | <code>boolean</code> | whether to submit remainder as a hidden order |
| orderType | <code>string</code> | LIMIT or MARKET |
| submitDelay | <code>number</code> | in ms, default 1500 |
| cancelDelay | <code>number</code> | in ms, default 5000 |
| _margin | <code>boolean</code> | if false, prefixes order type with EXCHANGE |

