'use strict'

const PI = require('p-iteration')

module.exports = class AsyncEventEmitter {
  constructor (props) {
    this.listeners = {}
  }

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

  once (eventName, cb) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    this.listeners[eventName].push({
      type: 'once',
      cb
    })
  }

  on (eventName, cb) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    this.listeners[eventName].push({
      type: 'on',
      cb
    })
  }

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
