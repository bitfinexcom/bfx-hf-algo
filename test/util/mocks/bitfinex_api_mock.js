'use strict'

const debug = require('debug')('BitfinexApiMock')

const WebSocketServerMock = require('./ws_mock')
const BitfinexSessionMock = require('./bitfinex_session_mock')

/**
 * @typedef {Object} ApiMockArgs
 * @property {Object} dataProviders
 */
class BitfinexApiMock {
  /**
   * @param {ApiMockArgs} args
   * @param {WsMockArgs} serverArgs
   */
  constructor (args = {}, serverArgs = {}) {
    const {
      dataProviders = {}
    } = args

    this._sessions = []
    this._dataProviders = dataProviders

    this._server = new WebSocketServerMock(serverArgs)
    this._server.onConnection(this._onConnection.bind(this))
    this._server.start()
  }

  /**
   * @param {function(BitfinexSessionMock)} fn
   */
  onSessionStarted (fn) {
    this._sessionHandler = fn
  }

  /**
   * @returns {string}
   */
  url () {
    return this._server.url()
  }

  close () {
    this._sessions.forEach(s => s.close())
    this._server.close()
  }

  _onConnection (conn) {
    const args = { dataProviders: this._dataProviders }
    const session = new BitfinexSessionMock(args, conn)
    this._sessions.push(session)

    if (this._sessionHandler) {
      this._sessionHandler(session)
    }

    debug('new connection')
  }
}

module.exports = BitfinexApiMock
