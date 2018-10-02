'use strict'

const PI = require('p-iteration')

/**
 * Event emitter class that provides an async `emit` function, useful for when
 * on needs to `await` the event and all of its listeners.
 */
module.exports = class AsyncEventEmitter {
  constructor () {
    this.listeners = {}
  }

  /**
   * Remove an event handler by event name
   *
   * @param {string} eventName
   * @param {Method} cb
   */
  off (eventName, cb) {
    if (!this.listeners[eventName]) {
      const i = this.listeners[eventName].findIndex(l => (
        l.cb === cb
      ))

      if (i !== -1) {
        this.listeners[eventName].splice(i, 1)
      }
    }
  }

  /**
   * Bind an event handler that should only fire once
   *
   * @param {string} eventName
   * @param {Method} cb
   */
  once (eventName, cb) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    this.listeners[eventName].push({
      type: 'once',
      cb
    })
  }

  /**
   * Bind an event handler
   *
   * @param {string} eventName
   * @param {Method} cb
   */
  on (eventName, cb) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    this.listeners[eventName].push({
      type: 'on',
      cb
    })
  }

  /**
   * Emit an event; can be await'ed, and will resolve after all handlers have
   * been called
   *
   * @param {string} eventName
   * @param  {...any} args
   * @return {Promise} p
   */
  async emit (eventName, ...args) {
    const listeners = this.listeners[eventName]
    const indexesToRemove = []

    if (!listeners) {
      return
    }

    await PI.forEach(listeners, async (l, i) => {
      await l.cb(...args)

      if (l.type === 'once') {
        indexesToRemove.unshift(i)
      }
    })

    indexesToRemove.forEach(rmi => listeners.splice(rmi, 1))
  }
}
