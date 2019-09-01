<a name="MACrossover"></a>

## MACrossover
MA Crossover triggers either a `MARKET` or a `LIMIT` order when two
user-defined moving averages cross. Users can configure either a standard MA
or an EMA individually for both long & short signals.

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | symbol to trade on |
| orderType | <code>string</code> | LIMIT or MARKET |
| orderPrice | <code>number</code> | price for order if `orderType` is LIMIT |
| amount | <code>number</code> | total order amount |
| _margin | <code>boolean</code> | if false, order type is prefixed with EXCHANGE |
| shortType | <code>string</code> | MA or EMA |
| shortEMATF | <code>string</code> | candle time frame for short EMA signal |
| shortEMAPeriod | <code>number</code> | cadnel period for short EMA signal |
| shortEMAPrice | <code>string</code> | candle price key for short EMA signal |
| shortMATF | <code>string</code> | candle time frame for short MA signal |
| shortMAPeriod | <code>number</code> | cadnel period for short MA signal |
| shortMAPrice | <code>string</code> | candle price key for short MA signal |
| longType | <code>string</code> | MA or EMA |
| longEMATF | <code>string</code> | candle time frame for long EMA signal |
| longEMAPeriod | <code>number</code> | cadnel period for long EMA signal |
| longEMAPrice | <code>string</code> | candle price key for long EMA signal |
| longMATF | <code>string</code> | candle time frame for long MA signal |
| longMAPeriod | <code>number</code> | cadnel period for long MA signal |
| longMAPrice | <code>string</code> | candle price key for long MA signal |

