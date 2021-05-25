'use strict'

const EventEmitter = require('events')
const debug = require('debug')('BitfinexApiMock')
const _omit = require('lodash/omit')

const {
  HEART_BEAT,
  FUNDING_LOAN_SNAPSHOT,
  POSITION_SNAPSHOT,
  WALLET_SNAPSHOT,
  ORDER_SNAPSHOT,
  FUNDING_OFFER_SNAPSHOT,
  FUNDING_CREDITS_SNAPSHOT,
  NOTIFICATION
} = require('./signal_types')

const MAIN_CHANNEL_ID = 0
const stateToSignal = {
  fundingLoan: FUNDING_LOAN_SNAPSHOT,
  positions: POSITION_SNAPSHOT,
  wallets: WALLET_SNAPSHOT,
  orders: ORDER_SNAPSHOT,
  fundingOffer: FUNDING_OFFER_SNAPSHOT,
  fundingCredits: FUNDING_CREDITS_SNAPSHOT
}

/**
 * @typedef {function(BitfinexSessionMock): function(Object|Array)} ApiEventHandler
 */

/**
 * @typedef {Object} AccountState
 * @property {Array} fundingLoan
 * @property {Array} positions
 * @property {Array} wallets
 * @property {Array} orders
 * @property {Array} fundingOffer
 * @property {Array} fundingCredits
 */

/**
 * @typedef {Object} ApiMockArgs
 * @property [Object.<string, ApiEventHandler>] eventHandlers Assign a handler function to a given event name
 * @property [AccountState] state Is used to send the snapshots' states when the auth is granted
 */

class BitfinexSessionMock extends EventEmitter {
  /**
   * @param {ApiMockArgs} args
   * @param {WsClient} conn
   */
  constructor (args, conn) {
    super()

    const {
      eventHandlers = {},
      state = {}
    } = args

    this._conn = conn
    this._chanId = 1
    this._channels = {}
    this._state = state
    this._startTime = Date.now()

    for (const [event, handler] of Object.entries(eventHandlers)) {
      this.on(event, handler(this))
    }

    this._conn.onMessage(this._onMessage.bind(this))
  }

  close () {
    Object.keys(this._channels).forEach(this.closeChannel.bind(this))
    this._conn.close()
    this.removeAllListeners()
  }

  /**
   * @param {string} event
   * @param {Object} payload
   */
  publish (event, payload = {}) {
    this.emit('outgoing', { name: event, payload })

    this._conn.send({
      ...payload,
      event
    })
  }

  createChannel () {
    const chanId = this._chanId++
    const channel = {}

    this._startHeartBeat(chanId, channel)
    this._channels[chanId] = channel

    return chanId
  }

  closeChannel (chanId) {
    const channel = this._channels[chanId]

    if (channel.stop) {
      channel.stop()
    }
  }

  each (ms, fn) {
    this._conn.each(ms, fn)
  }

  after (ms, fn) {
    this._conn.after(ms, fn)
  }

  sendSnapshots () {
    for (const [key, signal] of Object.entries(stateToSignal)) {
      const value = this._state[key] || []
      this._conn.streamTo(MAIN_CHANNEL_ID, signal, value)
    }
  }

  /**
   * @param {string} type
   * @param {string} status
   * @param {Array|Object} info
   * @param {string} text
   */
  notify (type, status, info, text = '') {
    const mts = this.now()

    this.emit('outgoing', { name: type, payload: { mts, type, info, status, text } })

    this._conn.streamTo(MAIN_CHANNEL_ID, NOTIFICATION, [mts, type, null, null, info, null, status, text])
  }

  now () {
    return Date.now() - this._startTime
  }

  /**
   * @param {WsClient} instance
   * @param {*} message
   * @private
   */
  _onMessage (instance, message) {
    let event, chanId, fields, payload

    if (message instanceof Array) {
      [chanId, event, ...fields] = message
      payload = { chanId, fields }
    } else {
      event = message.event
      payload = _omit(message, 'event')
    }

    console.log('->', JSON.stringify(message)) // TODO

    if (!event) {
      debug('could not handle message %j', message)
      return
    }

    this.emit('incoming', { name: event, payload })

    this.emit(event, payload)
  }

  _startHeartBeat (chanId, channel) {
    this._conn.each(500, (instance, stop) => {
      if (!channel.stop) {
        channel.stop = stop
      }

      instance.streamTo(chanId, HEART_BEAT)
    })
  }
}

module.exports = BitfinexSessionMock
