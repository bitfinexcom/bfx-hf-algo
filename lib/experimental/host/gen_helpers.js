'use strict'

const {
  cancelOrderWithDelay, submitOrderWithDelay
} = require('bfx-api-node-core')

const PI = require('p-iteration')
const Debug = require('debug')

module.exports = (state = {}) => {
  const { id, gid } = state
  const debug = Debug(`bfx:ao:algo:${id}:${gid}`)

  return {
    debug: (str, ...args) => {
      debug(str, ...args)
    },

    emitSelf: (name, ...args) => {
      state.ev.emit(`self:${name}`, ...args)
    },

    emitSelfAsync: (name, ...args) => {
      setTimeout(() => {
        state.ev.emit(`self:${name}`, ...args)
      }, 0)
    },

    emit: (name, ...args) => {
      state.ev.emit(name, ...args)
    },

    emitAsync: (name, ...args) => {
      setTimeout(() => {
        state.ev.emit(name, ...args)
      }, 0)
    },

    cancelOrderWithDelay: async (state = {}, delay, o) => {
      const { ws, orders = {} } = state
      const {
        [o.cid]: knownOrder,
        ...otherOrders
      } = orders

      await cancelOrderWithDelay(ws, delay, knownOrder)

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

      await submitOrderWithDelay(ws, delay, o)

      return {
        ...state,
        orders: {
          ...state.orders,
          [o.cid]: o,
        }
      }
    },

    declareEvent: (instance = {}, aoHost, eName, path) => {
      const { state = {} } = instance
      const { ev } = state
      ev.on(eName, aoHost.onAOSelfEvent.bind(aoHost, instance, path))
    }
  }
}
