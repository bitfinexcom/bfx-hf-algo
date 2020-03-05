'use strict'

const _get = require('lodash/get')
const _isFunction = require('lodash/isFunction')
const AsyncEventEmitter = require('../async_event_emitter')
const debug = require('debug')('bfx:hf:algo:testing:harness')

module.exports = (instance = {}, aoDef = {}, done = () => {}) => {
  const { state = {} } = instance
  const { ev: instanceEV } = state
  const ev = new AsyncEventEmitter()

  // Wrap AO state emitter so we can capture events
  state.ev._emit = state.ev.emit
  state.ev.emit = async (eventName, ...args) => {
    await state.ev._emit(eventName, ...args)
    await ev.emit(eventName, ...args)
  }

  // forward all internal events
  instanceEV.onAll((eventName, ...args) => {
    ev.emit(eventName, ...args)
  })

  const metaEV = {
    off: ev.off,
    removeAllListeners: ev.removeAllListeners,

    onAll: (handler) => {
      ev.onAll(async (...data) => {
        try {
          await handler(...data)
        } catch (e) {
          done(e)
        }
      })
    },

    on: (eventName, handler) => {
      ev.on(eventName, async (...data) => {
        try {
          await handler(...data)
        } catch (e) {
          done(e)
        }
      })
    },

    once: (eventName, handler) => {
      ev.once(eventName, async (...data) => {
        try {
          await handler(...data)
        } catch (e) {
          done(e)
        }
      })
    },

    trigger: async (section, eventName, ...args) => {
      const sectionHandlers = (aoDef.events || {})[section]
      const handler = _get((sectionHandlers || {}), eventName)

      if (!_isFunction(handler)) {
        debug('no handler for event %s:%s', section, eventName)
        return
      }

      debug('triggering %s:%s', section, eventName)
      await handler(instance, ...args)
      await ev.emit(`${section}:${eventName}`, instance, ...args)
    }
  }

  metaEV.next = (eventName, handler) => {
    metaEV.once(eventName, () => {
      metaEV.once(eventName, handler)
    })
  }

  return metaEV
}
