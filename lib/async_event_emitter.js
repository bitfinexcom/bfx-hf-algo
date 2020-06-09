'use strict'

const _isRegExp = require('lodash/isRegExp')
const _isUndefined = require('lodash/isUndefined')
const PI = require('p-iteration')

const CATCH_ALL_EVENT_NAME = '_*'

/**
 * Event emitter class that provides an async `emit` function, useful for when
 * one needs to `await` the event and all of its listeners.
 *
 * @class
 */
class AsyncEventEmitter {
  constructor () {
    this.listeners = []
  }

  /**
   * Removes all listeners, only those for the specified event name, or those
   * matching/not matching a regular expression
   *
   * @param {string|RegExp} matcher - regular expression or string to match
   *   with
   * @param {boolean} negativeMatch - if true, events not matching are deleted
   */
  removeAllListeners (matcher, negativeMatch) {
    if (_isUndefined(matcher) && !negativeMatch) {
      this.listeners = []
      return
    }

    let l
    let matched

    for (let i = this.listeners.length - 1; i >= 0; i -= 1) {
      l = this.listeners[i]
      matched = false

      if (
        (_isRegExp(matcher) && matcher.test(l.matcher.toString())) ||
        (l.matcher === matcher)
      ) {
        if (!negativeMatch) {
          this.listeners.splice(i, 1)
        }

        matched = true
      }

      if (!matched && negativeMatch) {
        this.listeners.splice(i, 1)
      }
    }
  }

  /**
   * Remove an event handler by event name
   *
   * @param {Function} cb - callback
   */
  off (cb) {
    for (let i = this.listeners.length - 1; i >= 0; i -= 1) {
      if (this.listeners[i].cb === cb) {
        this.listeners.splice(i, 1)
      }
    }
  }

  /**
   * Bind an event handler that should only fire once
   *
   * @param {string|RegExp} matcher - regular expression or string to match
   *   with
   * @param {Function} cb - callback
   */
  once (matcher, cb) {
    this.listeners.push({
      type: 'once',
      matcher,
      cb
    })
  }

  /**
   * Bind an event handler
   *
   * @param {string|RegExp} matcher - regular expression or string to match
   *   with
   * @param {Function} cb - callback
   */
  on (matcher, cb) {
    this.listeners.push({
      type: 'on',
      matcher,
      cb
    })
  }

  /**
   * Bind an event handler for all event types
   *
   * @param {Function} cb - callback
   * @returns {Promise} p - resolves when all listeners complete
   */
  onAll (cb) {
    return this.on(CATCH_ALL_EVENT_NAME, cb) // special event handler
  }

  /**
   * Bind an event handler for all event types that only fires once
   *
   * @param {Function} cb - callback
   * @returns {Promise} p - resolves when all listeners complete
   */
  onAllOnce (cb) {
    return this.once(CATCH_ALL_EVENT_NAME, cb) // special event handler
  }

  /**
   * Emit an event; can be await'ed, and will resolve after all handlers have
   * been called
   *
   * @param {string} eventName - event name to emit
   * @param  {...(object|Array|string|number)} args - arguments to pass to
   *   listeners
   * @returns {Promise} p - resolves when all listeners complete
   */
  async emit (eventName, ...args) {
    const indexesToRemove = []

    await PI.forEachSeries(this.listeners, async (l, i) => {
      if (
        (_isRegExp(l.matcher) && l.matcher.test(eventName)) ||
        (l.matcher === eventName)
      ) {
        await l.cb(...args)

        if (l.type === 'once') {
          indexesToRemove.push(i)
        }
      }
    })

    indexesToRemove.forEach(i => this.listeners.splice(i, 1))

    if (eventName !== CATCH_ALL_EVENT_NAME) {
      await this.emit(CATCH_ALL_EVENT_NAME, ...args)
    }
  }
}

module.exports = AsyncEventEmitter
