'use strict'

const debug = require('debug')('BitfinexApiMock')
const EventEmitter = require('events')

const WebSocketServerMock = require('./ws/ws_mock')
const BitfinexSessionMock = require('./bitfinex_session_mock')

class BitfinexApiMock extends EventEmitter {
  /**
   * @param {Object} args
   * @param {ApiMockArgs?} args.session
   * @param {WsMockArgs?} args.server
   */
  constructor (args = {}) {
    super()

    const {
      session = {},
      server = {}
    } = args

    this._sessions = []
    this._sessionArgs = session

    this._server = new WebSocketServerMock(server)
    this._server.onConnection(this._onConnection.bind(this))
    this._server.start()
      .then(() => this.emit('open'))
  }

  /**
   * @returns {string}
   */
  url () {
    return this._server.url()
  }

  /**
   * @returns {BitfinexSessionMock[]}
   */
  getSessions () {
    return this._sessions
  }

  close () {
    this.emit('close')
    this._sessions.forEach(s => s.close())
    this._server.close()
  }

  _onConnection (conn) {
    const session = new BitfinexSessionMock(this._sessionArgs, conn)
    this._sessions.push(session)

    debug('new connection')

    this.emit('new-session', session)
  }
}

module.exports = BitfinexApiMock
