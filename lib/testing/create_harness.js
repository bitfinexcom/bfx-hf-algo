'use strict'

const _get = require('lodash/get')
const _isFunction = require('lodash/isFunction')
const AsyncEventEmitter = require('../async_event_emitter')
const debug = require('debug')('bfx:hf:algo:testing:harness')

module.exports = (instance = {}, aoDef = {}) => {
  const { state = {} } = instance
  const { ev: instanceEV } = state
  const ev = new AsyncEventEmitter()

  // Wrap AO state emitter so we can capture events
  state.ev._emit = state.ev.emit
  state.ev.emit = async (eventName, ...args) => {
    debug('ao internal emit: %s', eventName)

    await ev.emit(eventName, ...args)
    await state.ev._emit(eventName, ...args)
  }

  // forward all internal events
  instanceEV.onAll((eventName, ...args) => {
    ev.emit(eventName, ...args)
  })

  ev.trigger = async (section, eventName, ...args) => {
    const sectionHandlers = (aoDef.events || {})[section]
    const handler = _get((sectionHandlers || {}), eventName)

    if (!_isFunction(handler)) {
      debug('no handler for event %s:%s', section, eventName)
      return
    }

    debug('emitting %s:%s', section, eventName)
    await ev.emit(`${section}:${eventName}`)

    await handler(instance, ...args)
  }

  return ev
}
