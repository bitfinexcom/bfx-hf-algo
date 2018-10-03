<a name="AOHost"></a>

## AOHost
The AOHost class provides a wrapper around the algo order system, and
manages lifetime events/order execution. Internally it hosts a Manager
instance from bfx-api-node-core for communication with the Bitfinex API, and
listens for websocket stream events in order to update order state/trigger
algo order events.

Execution is handled by an event system, with events being triggered by
Bitfinex API websocket stream payloads, and the algo orders themselves.

**Kind**: global class  

* [AOHost](#AOHost)
    * [new AOHost(args)](#new_AOHost_new)
    * [.connect()](#AOHost+connect)
    * [.getAO(id)](#AOHost+getAO) ⇒ <code>Object</code>
    * [.getAOInstance(gid)](#AOHost+getAOInstance) ⇒ <code>Object</code>
    * [.loadAllAOs()](#AOHost+loadAllAOs)
    * [.loadAO(id, gid, loadedState)](#AOHost+loadAO) ⇒ <code>string</code>
    * [.startAO(id, args)](#AOHost+startAO) ⇒ <code>string</code>
    * [.stopAO(gid)](#AOHost+stopAO)

<a name="new_AOHost_new"></a>

### new AOHost(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> |  |
| args.apiKey | <code>string</code> |  |
| args.apiSecret | <code>string</code> |  |
| args.wsURL | <code>string</code> | wss://api.bitfinex.com/ws/2 |
| args.restURL | <code>string</code> | https://api.bitfinex.com |
| args.agent | <code>Object</code> | optional proxy agent |
| args.aos | <code>Array.&lt;Object&gt;</code> | algo orders to manage |

<a name="AOHost+connect"></a>

### aoHost.connect()
Opens a new socket connection on the internal socket manager

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+getAO"></a>

### aoHost.getAO(id) ⇒ <code>Object</code>
Returns the algo order definition identified by the provided ID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>Object</code> - aoDef  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | i.e. bfx.iceberg |

<a name="AOHost+getAOInstance"></a>

### aoHost.getAOInstance(gid) ⇒ <code>Object</code>
Returns the active AO instance state identified by the provided GID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>Object</code> - state - algo order state  

| Param | Type | Description |
| --- | --- | --- |
| gid | <code>string</code> | algo order group ID |

<a name="AOHost+loadAllAOs"></a>

### aoHost.loadAllAOs()
Loads and starts all saved previously active algo orders

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
<a name="AOHost+loadAO"></a>

### aoHost.loadAO(id, gid, loadedState) ⇒ <code>string</code>
Loads and starts a single algo order, with the provided serialized state

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>string</code> - gid  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | algo order definition ID |
| gid | <code>string</code> | algo order instance group ID |
| loadedState | <code>Object</code> | algo order instance state |

<a name="AOHost+startAO"></a>

### aoHost.startAO(id, args) ⇒ <code>string</code>
Creates and starts a new algo order instance, based on the AO def
identified by the supplied ID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  
**Returns**: <code>string</code> - gid - instance GID  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | algo order definition ID, i.e. bfx.iceberg |
| args | <code>Object</code> | algo order arguments/parameters |

<a name="AOHost+stopAO"></a>

### aoHost.stopAO(gid)
Stops an algo order instance by GID

**Kind**: instance method of [<code>AOHost</code>](#AOHost)  

| Param | Type | Description |
| --- | --- | --- |
| gid | <code>string</code> | algo order instance GID |

