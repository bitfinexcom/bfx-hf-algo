'use strict'

const {
  cancelOrderWithDelay, submitOrderWithDelay
} = require('bfx-api-node-core')

const Promise = require('bluebird')
const PI = require('p-iteration')
const Debug = require('debug')

module.exports = (state = {}) => {
  const { id, gid } = state
  const debug = Debug(`bfx:ao:algo:${id}:${gid}`)

  return {
    debug: (str, ...args) => {
      debug(str, ...args)
    },

    emitSelf: async (name, ...args) => {
      debug('emit self:%s', name)
      await state.ev.emit(`self:${name}`, ...args)
    },

    emitSelfAsync: async (name, ...args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          debug('emit self:%s', name)

          state.ev
            .emit(`self:${name}`, ...args)
            .then(resolve)
            .catch(reject)
        }, 0)
      })
    },

    emit: async (name, ...args) => {
      debug('emit %s', name)
      await state.ev.emit(name, ...args)
    },

    emitAsync: async (name, ...args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          debug('emit %s', name)

          state.ev
            .emit(name, ...args)
            .then(resolve)
            .catch(reject)
        }, 0)
      })
    },

    cancelOrderWithDelay: async (state = {}, delay, o) => {
      const { ws, orders = {} } = state
      const {
        [o.cid + '']: knownOrder,
        ...otherOrders
      } = orders

      await cancelOrderWithDelay(ws, delay, o)

      return {
        ...state,
        orders: otherOrders
      }
    },

    cancelAllOrdersWithDelay: async (state = {}, delay) => {
      const { orders = {}, ws } = state

      await PI.map(Object.values(orders), async (o) => {
        return cancelOrderWithDelay(ws, delay, o)
      })

      return {
        ...state,
        orders: {}
      }
    },

    submitOrderWithDelay: async (state = {}, delay, o) => {
      const { ws } = state
      const order = await submitOrderWithDelay(ws, delay, o)

      return {
        ...state,
        orders: {
          ...state.orders,
          [o.cid + '']: order,
        }
      }
    },

    declareEvent: (instance = {}, aoHost, eName, path) => {
      const { state = {} } = instance
      const { ev } = state
      const handler = aoHost.onAOSelfEvent.bind(aoHost, instance, path)

      ev.on(eName, handler)
    },

    updateState: async (instance = {}, update = {}) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('state:update', gid, update)

      return instance.state // updated ref
    },

    subscribeChannel: async (instance = {}, type, filter) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('channel:subscribe', gid, type, filter)
    },

    unsubscribeChannel: async (instance = {}, type, filter) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('channel:unsubscribe', gid, type, filter)
    }
  }
}
