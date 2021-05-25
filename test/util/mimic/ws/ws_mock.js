'use strict'

const WebSocket = require('ws')
const flatPromise = require('flat-promise')

const WsClient = require('./ws_client')

const DEFAULT_HOST = 'localhost'
const DEFAULT_SCHEMA = 'ws'

let port = 42000
const nextPort = () => {
  return port++
}

/**
 * @typedef {Object} WsMockArgs
 * @property {number} [interval]
 * @property {string} [host]
 * @property {number} [port]
 * @property {Codec} [codec] - message codec, defaults to JsonCodec
 */
class WsMock {
  /**
   * @param {WsMockArgs} args
   */
  constructor (args = {}) {
    const {
      interval,
      host = DEFAULT_HOST,
      schema = DEFAULT_SCHEMA,
      port,
      codec
    } = args

    /**
     * @type {WsClientArgs}
     * @private
     */
    this._clientArgs = {
      interval,
      codec
    }

    this._host = host
    this._port = port || nextPort()
    this._schema = schema

    /**
     * @type {function(WsClient)}
     * @private
     */
    this._connectionHandler = null
  }

  /**
   * @param {function(WsClient)} fn
   */
  onConnection (fn) {
    this._connectionHandler = fn
  }

  /**
   * @returns {number}
   */
  port () {
    return this._port
  }

  /**
   * @returns {string}
   */
  url () {
    return `${this._schema}://${this._host}:${this._port}`
  }

  /**
   * @returns {WebSocket}
   */
  connect () {
    return new WebSocket(this.url())
  }

  start () {
    const { promise, resolve, reject } = flatPromise()

    this._ws = new WebSocket.Server({ port: this._port })
    this._ws.on('open', resolve)
    this._ws.on('connection', this._onNewConnection.bind(this))
    this._ws.on('error', reject)

    return promise
  }

  close () {
    this._ws.close()
  }

  /**
   * @param {WebSocket} conn
   * @private
   */
  _onNewConnection (conn) {
    const client = new WsClient(conn, this._clientArgs)

    if (this._connectionHandler) {
      this._connectionHandler(client)
    }
  }
}

module.exports = WsMock
