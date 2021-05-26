'use strict'

const SessionSpy = require('./session_spy')

class ApiSpy {
  /**
   * @param {BitfinexApiMock} server
   */
  constructor (server) {
    this.connections = []

    server.on('new-session', this._onNewSession.bind(this))
  }

  _onNewSession (session) {
    const spy = new SessionSpy(session)
    this.connections.push(spy)
  }
}

module.exports = ApiSpy
