'use strict'

const Promise = require('bluebird')
const _pick = require('lodash/pick')
const _isEqual = require('lodash/isEqual')
const _isObject = require('lodash/isObject')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')
const { EventEmitter } = require('events')
const debug = require('debug')('bfx:hf:ext-plugin:bitfinex:ao-adpater')
const ManagedOB = require('bfx-api-node-plugin-managed-ob')
const ManagedCandles = require('bfx-api-node-plugin-managed-candles')
const Watchdog = require('bfx-api-node-plugin-wd')
const { Order } = require('bfx-api-node-models')
const {
  subscribe, unsubscribe, findChannelId, Manager, cancelOrder, submitOrder,
  send
} = require('bfx-api-node-core')

const HB_INTERVAL_MS = 2500

module.exports = class AOAdapter extends EventEmitter {
  static getTimeFrames () {
    return {
      '1 Minute': '1m',
      '5 Minutes': '5m',
      '15 Minutes': '15m',
      '30 Minutes': '30m',
      '1 Hour': '1h',
      '3 Hours': '3h',
      '6 Hours': '6h',
      '12 Hours': '12h',
      '1 Day': '1D',
      '7 Days': '7D',
      '14 Days': '14D',
      '1 Month': '1M'
    }
  }

  constructor ({
    wsURL, restURL, apiKey, apiSecret, agent, dms, withHeartbeat, affiliateCode
  }) {
    super()

    this.pendingOrderSubmitCancelTimeouts = []
    this.affiliateCode = affiliateCode
    this.hbEnabled = withHeartbeat
    this.hbInterval = null
    this.m = new Manager({
      plugins: [ManagedOB(), ManagedCandles(), Watchdog({
        packetWDDelay: 30 * 1000
      })],

      transform: true,
      dms,
      apiSecret,
      apiKey,
      agent,
      wsURL,
      restURL
    })

    this.m.on('ws2:error', this.propagateEvent.bind(this, 'meta:error'))
    this.m.on('ws2:ticker', this.propagateDataEvent.bind(this, 'ticker'))
    this.m.on('ws2:trades', this.propagateDataEvent.bind(this, 'trades'))
    this.m.on('ws2:candles', this.propagateDataEvent.bind(this, 'candles'))
    this.m.on('ws2:book', this.propagateDataEvent.bind(this, 'book'))
    this.m.on('ws2:managed:book', this.propagateDataEvent.bind(this, 'managed:book'))
    this.m.on('ws2:managed:candles', this.propagateDataEvent.bind(this, 'managed:candles'))
    this.m.on('ws2:notification', this.propagateDataEvent.bind(this, 'notification'))

    this.m.on('socket:updated', this.onSocketUpdate.bind(this))
    this.m.on('ws2:event:info-server-restart', this.onServerRestart.bind(this))
    this.m.on('ws2:reopen', this.onWSReopen.bind(this))

    this.m.on('ws2:open', this.propagateEvent.bind(this, 'open'))
    this.m.on('ws2:event:auth:success', this.propagateEvent.bind(this, 'auth:success'))
    this.m.on('ws2:event:auth:error', this.propagateEvent.bind(this, 'auth:error'))
    this.m.on('ws2:auth:n', this.propagateEvent.bind(this, 'auth:n'))
    this.m.on('ws2:auth:os', this.propagateEvent.bind(this, 'order:snapshot'))
    this.m.on('ws2:auth:on', this.propagateEvent.bind(this, 'order:new'))
    this.m.on('ws2:auth:ou', this.propagateEvent.bind(this, 'order:update'))
    this.m.on('ws2:auth:oc', this.propagateEvent.bind(this, 'order:close'))
    this.m.on('ws2:data:trades', this.propagateEvent.bind(this, 'trades'))
    this.m.on('ws2:data:book', this.propagateEvent.bind(this, 'book'))
  }

  updateAuthArgs (args = {}) {
    this.m.updateAuthArgs(args)
  }

  reconnect () {
    if (this.hbInterval !== null) {
      clearInterval(this.hbInterval)
      this.hbInterval = null
    }

    this.m.reconnectAllSockets()

    if (this.hbEnabled) {
      this.hbInterval = setInterval(this.sendHB.bind(this), HB_INTERVAL_MS)
    }
  }

  connect () {
    this.m.openWS()

    if (this.hbEnabled) {
      this.hbInterval = setInterval(this.sendHB.bind(this), HB_INTERVAL_MS)
    }
  }

  /**
    * @return {Promise} p
    */
  disconnect () {
    if (this.hbInterval !== null) {
      clearInterval(this.hbInterval)
      this.hbInterval = null
    }

    // Clean up pending actions
    this.pendingOrderSubmitCancelTimeouts.forEach(timeoutObject => {
      if (timeoutObject.t !== null) {
        clearTimeout(timeoutObject.t)
        timeoutObject.t = null
      }
    })

    this.pendingOrderSubmitCancelTimeouts = []

    return this.m.closeAllSockets()
  }

  sendHB () {
    this.m.withAuthSocket((ws) => {
      send(ws, [0, 'n', null, {
        mid: Date.now(),
        type: 'ucm-hb',
        info: {}
      }])
    })
  }

  getConnection () {
    const id = this.m.sampleWSI()
    const c = this.m.getWSByIndex(id)

    return { id, c }
  }

  propagateEvent (name, ...args) {
    this.emit(name, ...args)
  }

  propagateDataEvent (name, data, meta = {}) {
    this.emit(`data:${name}`, data, meta)
  }

  onSocketUpdate (i, state) {
    this.emit('meta:connection:update', i, state)
  }

  onServerRestart () {
    // Otherwise the DMS flag closes all orders, and the packets are received
    // after a server restart, before the connection drops. We cannot
    // differentiate between manual user cancellations and those packets.
    this._ignoreOrderEvents = true
  }

  onWSReopen () {
    this._ignoreOrderEvents = false // see onServerRestart
    this.emit('meta:reload')
  }

  subscribe (connection, channel, filter) {
    subscribe(connection.c, channel, filter)
  }

  unsubscribe (connection, channel, filter) {
    const cid = findChannelId(connection.c, (data) => {
      if (data.channel !== channel) {
        return false
      }

      const fv = _pick(data, Object.keys(filter))
      return _isEqual(filter, fv)
    })

    if (!cid) {
      return debug('error unsubscribing: unknown channel %s', channel)
    }

    unsubscribe(connection.c, cid)
  }

  orderEventsValid () {
    return !this._ignoreOrderEvents
  }

  async submitOrderWithDelay (connection, delay, order) {
    const { c } = connection

    if (_isString(this.affiliateCode) && !_isEmpty(this.affiliateCode)) {
      if (order instanceof Order) {
        order.affiliateCode = this.affiliateCode
      } else if (_isObject(order)) {
        if (!order.meta) {
          order.meta = {}
        }

        order.meta.aff_code = this.affiliateCode // eslint-disable-line
      }
    }

    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        timeoutObject.t = null

        submitOrder(c, order)
          .then(resolve)
          .catch(reject)
      }, delay)

      const timeoutObject = { t }
      this.pendingOrderSubmitCancelTimeouts.push(timeoutObject)
    })
  }

  async cancelOrderWithDelay (connection, delay, order) {
    const { c } = connection

    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        timeoutObject.t = null

        cancelOrder(c, order)
          .then(resolve)
          .catch(reject)
      }, delay)

      const timeoutObject = { t }
      this.pendingOrderSubmitCancelTimeouts.push(timeoutObject)
    })
  }

  sendWithAnyConnection (packet) {
    this.m.withAuthSocket((ws) => {
      send(ws, packet)
    })
  }

  notify (ws, level, message) {
    send(ws, [0, 'n', null, {
      type: 'ucm-notify-ui',
      info: {
        level,
        message
      }
    }])
  }
}
