'use strict'

const assert = require('assert')

class SessionSpy {
  /**
   * @param {BitfinexSessionMock} session
   */
  constructor (session) {
    this._incomingEvents = []
    this._outgoingEvents = []

    session.on('incoming', this._onIncomingMessage.bind(this))
    session.on('outgoing', this._onOutgoingMessage.bind(this))
  }

  /**
   * @returns {SessionSpy}
   */
  sent (name, fn = undefined) {
    this._assertEvent(this._outgoingEvents, name, fn)
    return this
  }

  /**
   * @returns {SessionSpy}
   */
  received (name, fn = undefined) {
    this._assertEvent(this._incomingEvents, name, fn)
    return this
  }

  findReceived (name) {
    return this._getEvents(this._incomingEvents, name).map(item => item.payload)
  }

  findSent (name) {
    return this._getEvents(this._outgoingEvents, name).map(item => item.payload)
  }

  countReceived (name) {
    return this._count(this._incomingEvents, name)
  }

  countSent (name) {
    return this._count(this._outgoingEvents, name)
  }

  _onIncomingMessage (event) {
    this._incomingEvents.push(event)
  }

  _onOutgoingMessage (event) {
    this._outgoingEvents.push(event)
  }

  _getEvents (iter, name) {
    return iter.filter((e) => e.name === name)
  }

  _count (iter, name) {
    return this._getEvents(iter, name).length
  }

  _assertEvent (iter, name, fn) {
    const event = this._findEvent(iter, name)

    if (!event) {
      assert.fail(`Event ${name} not found`)
      return
    }

    if (fn) {
      this._forEachEvent(iter, name, (event, i) => fn(event.payload, i))
    }
  }

  _findEvent (iter, name) {
    return iter.find(event => event.name === name)
  }

  _forEachEvent (iter, name, fn) {
    this._getEvents(iter, name).forEach(fn)
  }
}

module.exports = SessionSpy
