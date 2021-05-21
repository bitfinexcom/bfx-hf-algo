'use strict'

const EventEmitter = require('events')
const _isFunction = require('lodash/isFunction')

const { JsonCodec } = require('./codecs')

const DEFAULT_INTERVAL = 50

/**
 * @typedef {Object} WsClientArgs
 * @property {number} [interval]
 * @property {Codec} [codec] - message codec, defaults to JsonCodec
 */
class WsClient {
  /**
   * @param {WebSocket} conn
   * @param {WsClientArgs} args
   */
  constructor (conn, args = {}) {
    const {
      interval = DEFAULT_INTERVAL,
      codec = JsonCodec
    } = args

    this._conn = conn
    this._interval = interval
    this._codec = codec

    this._timeouts = []
    this._intervals = []
    this._messages = []
    this._ev = new EventEmitter()

    this._start()
  }

  /**
   * @param {*} message
   * @returns {WsClient}
   */
  send (message) {
    this._messages.push(message)
    return this
  }

  /**
   * @param {number} chanId
   * @param {*} parts
   */
  streamTo (chanId, ...parts) {
    this.send([chanId, ...parts])
  }

  /**
   * @param {number} ms
   * @param {function(WsClient)|*} messageOrHandler
   * @returns {WsClient}
   */
  after (ms, messageOrHandler) {
    const run = () =>
      _isFunction(messageOrHandler)
        ? messageOrHandler(this)
        : this.send(messageOrHandler)

    const timeout = setTimeout(run, ms)

    this._timeouts.push(timeout)

    return this
  }

  /**
   * @param {number} ms
   * @param {function(WsClient, StopCb, *)} fn
   * @returns {WsClient}
   */
  each (ms, fn) {
    let state

    /**
     * @typedef {function()} StopCb - stops iteration
     */
    const stop = () => clearInterval(interval)

    const run = () => {
      state = fn(this, stop, state)
    }

    const interval = setInterval(run, ms)

    this._intervals.push(interval)

    return this
  }

  /**
   * @param {function(WsClient, *)} fn
   * @returns {WsClient}
   */
  onMessage (fn) {
    this._ev.on('message', (payload) => {
      const message = this._codec
        ? this._codec.decode(payload)
        : payload

      fn(this, message)
    })

    return this
  }

  close () {
    this._timeouts.forEach((t) => clearTimeout(t))
    this._intervals.forEach((i) => clearInterval(i))
    this._ev.removeAllListeners()
  }

  _start () {
    this._conn.on('close', () => {
      this.close()
    })

    this._conn.on('message', (data) => {
      this._ev.emit('message', data)
    })

    const interval = setInterval(this._pullMessages.bind(this), this._interval)
    this._intervals.push(interval)
  }

  /**
   * @private
   */
  _pullMessages () {
    const message = this._messages.shift()
    if (!message) return

    const payload = this._codec
      ? this._codec.encode(message)
      : message

    this._conn.send(payload)
  }
}

module.exports = WsClient
