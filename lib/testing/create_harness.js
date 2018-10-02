'use strict'

const _get = require('lodash/get')
const _isFunction = require('lodash/isFunction')
const AsyncEventEmitter = require('async_event_emitter')
const debug = require('debug')('bfx:hf:algo:testing:harness')

module.exports = (instance = {}, aoDef = {}) => {
  const { state = {} } = instance
  const ev = new AsyncEventEmitter()

  // Wrap AO state emitter so we can capture events
  state.ev._emit = state.ev.emit
  state.ev.emit = (eventName, ...args) => {
    debug('ao internal emit: %s', eventName)

    ev.emit(eventName, ...args)
    state.ev._emit(eventName, ...args)
  }

  ev.trigger = async (section, eventName, ...args) => {
    const sectionHandlers = (aoDef.events || {})[section]
    const handler = _get((sectionHandlers || {}), eventName)

    if (!_isFunction(handler)) {
      debug('no handler for event %s:%s', section, eventName)
      return
    }

    debug('emitting %s:%s', section, eventName)
    ev.emit(`${section}:${eventName}`)

    await handler(instance, ...args)
  }

  return ev
}
