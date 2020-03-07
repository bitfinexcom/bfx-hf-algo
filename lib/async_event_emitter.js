'use strict'

const _isString = require('lodash/isString')
const _includes = require('lodash/includes')
const PI = require('p-iteration')

const CATCH_ALL_EVENT_NAME = '_*'

/**
 * Event emitter class that provides an async `emit` function, useful for when
 * one needs to `await` the event and all of its listeners.
 */
module.exports = class AsyncEventEmitter {
  constructor () {
    this.listeners = {}
  }

  /**
   * Removes all listeners, only those for the specified event name, or those
   * matching/not matching a regular expression
   *
   * @param {string|RegExp} eventName - can be a regular expression
   * @param {boolean} negativeMatch - if true, events not matching the regexp are deleted
   */
  removeAllListeners (eventName, negativeMatch) {
    if (eventName instanceof RegExp) {
      const events = Object.keys(this.listeners)

      for (let i = 0; i < events.length; i += 1) {
        const evName = events[i]

        if (eventName.test(evName) === !negativeMatch) {
          delete this.listeners[evName]
        }
      }
    } else if (_isString(eventName)) {
      delete this.listeners[eventName]
    } else {
      this.listeners = {}
    }
  }

  /**
   * Remove an event handler by event name
   *
   * @param {string} eventName
   * @param {Method} cb
   */
  off (eventName, cb) {
    if (!this.listeners[eventName]) {
      return
    }

    const i = this.listeners[eventName].findIndex(l => (
      l.cb === cb
    ))

    if (i !== -1) {
      this.listeners[eventName].splice(i, 1)
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
    * Bind an event handler for all event types
    *
    * @param {Method} cb
    */
  onAll (cb) {
    return this.on(CATCH_ALL_EVENT_NAME, cb) // special event handler
  }

  /**
    * Bind an event handler for all event types that only fires once
    *
    * @param {Method} cb
    */
  onAllOnce (cb) {
    return this.once(CATCH_ALL_EVENT_NAME, cb) // special event handler
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

    // TODO: Refactor
    if (eventName !== CATCH_ALL_EVENT_NAME) {
      const catchAllListeners = this.listeners[CATCH_ALL_EVENT_NAME]

      if (catchAllListeners) {
        const indexesToRemove = []

        await PI.forEachSeries(catchAllListeners, async (l, i) => {
          if (_includes(indexesToRemove, i)) {
            return
          }

          if (l.type === 'once') {
            indexesToRemove.unshift(i)
          }

          return l.cb(eventName, ...args)
        })

        indexesToRemove.forEach(rmi => catchAllListeners.splice(rmi, 1))
      }
    }

    if (listeners) {
      const indexesToRemove = []

      await PI.forEachSeries(listeners, async (l, i) => {
        if (_includes(indexesToRemove, i)) {
          return
        }

        if (l.type === 'once') {
          indexesToRemove.unshift(i)
        }

        return l.cb(...args)
      })

      indexesToRemove.forEach(rmi => listeners.splice(rmi, 1))
    }
  }
}
