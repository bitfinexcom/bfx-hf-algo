'use strict'

const assert = require('assert')

class Iterator {
  constructor () {
    this._offset = 0
    this._items = []
  }

  push (item) {
    this._items.push(item)
  }

  hasNext () {
    return this._offset < this._items.length
  }

  next () {
    if (!this.hasNext()) return
    return this._items[this._offset++]
  }

  items () {
    return this._items
  }
}

class SessionSpy {
  /**
   * @param {BitfinexSessionMock} session
   */
  constructor (session) {
    this._incomingEvents = new Iterator()
    this._outgoingEvents = new Iterator()

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

  _count (iter, name) {
    return iter.items()
      .filter((e) => e.name === name)
      .length
  }

  _assertEvent (iter, name, fn) {
    const event = this._findEvent(iter, name)

    if (!event) {
      assert.fail(`Event ${name} not found`)
      return
    }

    if (fn) {
      fn(event.payload)
    }
  }

  _findEvent (iter, name) {
    while (iter.hasNext()) {
      const event = iter.next()

      if (event.name === name) {
        return event
      }
    }
  }
}

module.exports = SessionSpy
