## Functions

<dl>
<dt><a href="#debug">debug(str, ...args)</a></dt>
<dd><p>Logs a string to the console, tagged by AO id/gid</p>
</dd>
<dt><a href="#emitSelf">emitSelf(eventName, ...eventArgs)</a></dt>
<dd><p>Triggeres an event on the &#39;self&#39; section</p>
</dd>
<dt><a href="#emitSelfAsync">emitSelfAsync(eventName, ...eventArgs)</a></dt>
<dd><p>Like <code>emitSelf</code> but operates after a timeout</p>
</dd>
<dt><a href="#emit">emit(eventName, ...eventArgs)</a></dt>
<dd><p>Triggers a generic event</p>
</dd>
<dt><a href="#emitAsync">emitAsync(eventName, ...eventArgs)</a></dt>
<dd><p>Like <code>emit</code> but operates after a timeout</p>
</dd>
<dt><a href="#notifyUI">notifyUI(level, message)</a></dt>
<dd><p>Triggers an UI notification, sent out via the active websocket connection</p>
</dd>
<dt><a href="#cancelOrderWithDelay">cancelOrderWithDelay(state, delay, order)</a> ⇒ <code>Object</code></dt>
<dd><p>Cancels the provided order after a delay, and removes it from the active
order set.</p>
</dd>
<dt><a href="#cancelAllOrdersWithDelay">cancelAllOrdersWithDelay(state, delay)</a> ⇒ <code>Object</code></dt>
<dd><p>Cancels all orders currently on the AO state after the specified delay</p>
</dd>
<dt><a href="#submitOrderWithDelay">submitOrderWithDelay(state, delay, order)</a> ⇒ <code>Object</code></dt>
<dd><p>Submits an order after a delay, and adds it to the active order set on
the AO state.</p>
</dd>
<dt><a href="#declareEvent">declareEvent(instance, aoHost, eventName, path)</a></dt>
<dd><p>Hooks up the listener for a new event on the &#39;self&#39; section</p>
</dd>
<dt><a href="#declareChannel">declareChannel(instance, aoHost, channel, filter)</a> ⇒ <code>Object</code></dt>
<dd><p>Assigns a data channel to the provided AO instance</p>
</dd>
<dt><a href="#updateState">updateState(instance, update)</a> ⇒ <code>Object</code></dt>
<dd><p>Updates the state for the provided AO instance</p>
</dd>
</dl>

<a name="debug"></a>

## debug(str, ...args)
Logs a string to the console, tagged by AO id/gid

**Kind**: global function  

| Param | Type |
| --- | --- |
| str | <code>string</code> | 
| ...args | <code>any</code> | 

<a name="emitSelf"></a>

## emitSelf(eventName, ...eventArgs)
Triggeres an event on the 'self' section

**Kind**: global function  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| ...eventArgs | <code>any</code> | 

**Example**  
```js
await emitSelf('submit_orders')
```
<a name="emitSelfAsync"></a>

## emitSelfAsync(eventName, ...eventArgs)
Like `emitSelf` but operates after a timeout

**Kind**: global function  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| ...eventArgs | <code>any</code> | 

<a name="emit"></a>

## emit(eventName, ...eventArgs)
Triggers a generic event

**Kind**: global function  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| ...eventArgs | <code>any</code> | 

**Example**  
```js
await emit('exec:order:submit:all', gid, [order], submitDelay)
```
<a name="emitAsync"></a>

## emitAsync(eventName, ...eventArgs)
Like `emit` but operates after a timeout

**Kind**: global function  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| ...eventArgs | <code>any</code> | 

<a name="notifyUI"></a>

## notifyUI(level, message)
Triggers an UI notification, sent out via the active websocket connection

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>string</code> | 'info', 'success', 'error', 'warning' |
| message | <code>string</code> | notification content |

**Example**  
```js
await notifyUI('info', `Scheduled tick in ${delay}s`)
```
<a name="cancelOrderWithDelay"></a>

## cancelOrderWithDelay(state, delay, order) ⇒ <code>Object</code>
Cancels the provided order after a delay, and removes it from the active
order set.

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | current AO instance state |
| delay | <code>number</code> | in ms |
| order | <code>Order</code> |  |

<a name="cancelAllOrdersWithDelay"></a>

## cancelAllOrdersWithDelay(state, delay) ⇒ <code>Object</code>
Cancels all orders currently on the AO state after the specified delay

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | current AO instance state |
| delay | <code>number</code> | in ms |

<a name="submitOrderWithDelay"></a>

## submitOrderWithDelay(state, delay, order) ⇒ <code>Object</code>
Submits an order after a delay, and adds it to the active order set on
the AO state.

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | current AO instance state |
| delay | <code>number</code> |  |
| order | <code>Order</code> |  |

<a name="declareEvent"></a>

## declareEvent(instance, aoHost, eventName, path)
Hooks up the listener for a new event on the 'self' section

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>Object</code> | full AO instance, with state/h |
| aoHost | <code>Object</code> |  |
| eventName | <code>string</code> |  |
| path | <code>string</code> | on the 'self' section |

**Example**  
```js
declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
```
<a name="declareChannel"></a>

## declareChannel(instance, aoHost, channel, filter) ⇒ <code>Object</code>
Assigns a data channel to the provided AO instance

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>Object</code> | full AO instance, with state/h |
| aoHost | <code>Object</code> |  |
| channel | <code>string</code> | channel name, i.e. 'ticker' |
| filter | <code>Object</code> | channel spec, i.e. { symbol: 'tBTCUSD' } |

**Example**  
```js
await declareChannel(instance, host, 'trades', { symbol })
```
<a name="updateState"></a>

## updateState(instance, update) ⇒ <code>Object</code>
Updates the state for the provided AO instance

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type | Description |
| --- | --- | --- |
| instance | <code>Object</code> | full AO instance, with state/h |
| update | <code>Object</code> | new state |

