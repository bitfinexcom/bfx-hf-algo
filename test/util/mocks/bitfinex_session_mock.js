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
  FUNDING_CREDITS_SNAPSHOT
} = require('./signal_types')

const MAIN_CHANNEL_ID = 0
const SNAPSHOT_TYPES = [
  POSITION_SNAPSHOT,
  WALLET_SNAPSHOT,
  ORDER_SNAPSHOT,
  FUNDING_OFFER_SNAPSHOT,
  FUNDING_CREDITS_SNAPSHOT,
  FUNDING_LOAN_SNAPSHOT
]

class BitfinexSessionMock extends EventEmitter {
  /**
   * @param {ApiMockArgs} args
   * @param {WsClient} conn
   */
  constructor (args, conn) {
    super()

    const {
      dataProviders = {}
    } = args

    this._dataProviders = dataProviders
    this._conn = conn
    this._chanId = 1

    this._conn.onMessage(this._onMessage.bind(this))
    this.on('subscribe', this._onSubscribeChannel.bind(this))
    this.on('ping', this._pong.bind(this))
  }

  close () {
    this._conn.close()
    this.removeAllListeners()
  }

  /**
   * @param {string} event
   * @param {Object} payload
   */
  publish (event, payload = {}) {
    this._conn.send({
      ...payload,
      event
    })
  }

  /**
   * @param {function(BitfinexSessionMock, AuthEvent): boolean} fn
   * @returns BitfinexSessionMock
   */
  handleAuth (fn) {
    /**
     * @typedef {Object} AuthEvent
     * @property {number} dms
     * @property {number} calc
     * @property {string} apiKey
     * @property {string} authSig
     * @property {string} authPayload
     * @property {number} authNonce
     */
    this.on('auth', (event) => {
      const isAuthorized = fn(this, event)
      this._onAuthAttempt(isAuthorized)
    })

    return this
  }

  _onAuthAttempt (isAuthorized) {
    if (!isAuthorized) {
      this.publish('auth', {
        status: 'FAILED',
        chanId: MAIN_CHANNEL_ID,
        code: 0,
        msg: 'rejected'
      })
      return
    }

    this.publish('auth', {
      status: 'OK',
      chanId: MAIN_CHANNEL_ID,
      usedId: 1,
      dms: 4,
      auth_id: 'auth id',
      caps: {}
    })

    this._conn.after(1000, this._sendSnapshots)
  }

  /**
   * @param {WsClient} conn
   * @private
   */
  _sendSnapshots (conn) {
    SNAPSHOT_TYPES.forEach(type => {
      conn.streamTo(MAIN_CHANNEL_ID, type, [])
    })
  }

  /**
   * @typedef {Object} SubscribeEvent
   * @property {string} event
   * @property {string} channel
   * @property {string} [symbol]
   * @property {string} [key]
   */
  /**
   * @param {SubscribeEvent} message
   * @private
   */
  _onSubscribeChannel (message) {
    const { event, channel, ...fields } = message
    const dataProvider = this._dataProviders[channel]

    if (!dataProvider) {
      debug('Could not find a data provider for book channel')
      return
    }

    const chanId = this._nextChannel()

    this.publish('subscribed', { ...fields, channel, chanId })
    this._startHeartBeat(chanId)

    this._conn.each(1000, (instance, stop, prevState) => {
      const state = dataProvider(fields, prevState)
      instance.streamTo(chanId, state)

      return state
    })
  }

  /**
   * @param {WsClient} instance
   * @param {*} message
   * @private
   */
  _onMessage (instance, message) {
    if (!message.event) {
      debug('could not handle message %j', message)
      return
    }

    console.log('->', JSON.stringify(message)) // TODO

    this.emit(message.event, _omit(message, 'event'))
  }

  _startHeartBeat (chanId) {
    this._conn.each(500, (instance) => {
      instance.streamTo(chanId, HEART_BEAT)
    })
  }

  _pong ({ cid }) {
    this.publish('pong', { cid })
  }

  _nextChannel () {
    return this._chanId++
  }
}

module.exports = BitfinexSessionMock
