<a name="PingPong"></a>

## PingPong
Ping/pong submits multiple 'ping' orders; once a ping order fills, an
associated 'pong' order is submitted.

Multiple ping/pong pairs can be created by specifying an order count greater
than 1, a suitable min/max ping price, and a pong distance. Multiple ping
orders will be created between the specified min/max prices, with the
associated pongs offset by the pong distance from the ping price.

When operating in 'endless' mode, new ping orders will be submitted when
their associated pongs fill.

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| endless | <code>boolean</code> | if enabled, pong fill will trigger a new ping |
| symbol | <code>string</code> | symbol to trade on |
| amount | <code>number</code> | individual ping/pong order amount |
| orderCount | <code>number</code> | number of ping/pong pairs to create, 1 or more |
| pingPrice | <code>number</code> | used for a single ping/pong pair |
| pongPrice | <code>number</code> | used for a single ping/pong pair |
| pingMinPrice | <code>number</code> | minimum price for ping orders |
| pingMaxPrice | <code>number</code> | maximum price for ping orders |
| pongDistance | <code>number</code> | pong offset from ping orders for multiple pairs |

