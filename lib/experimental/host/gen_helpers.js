'use strict'

const {
  cancelOrderWithDelay, submitOrderWithDelay
} = require('bfx-api-node-core')
const PI = require('p-iteration')

module.exports = (state = {}) => ({
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

  cancelAllOrdersWithDelay: async (state = {}, delay) => {
    const { orders = {} } = state

    await PI.map(Object.values(orders), async (o) => {
      return cancelOrderWithDelay(state, delay, o)
    })

    return {
      ...state,
      orders: {}
    }
  },

  submitOrderWithDelay: async (state = {}, delay, o) => {
    await submitOrderWithDelay(state, delay, o)

    return {
      ...state,
      orders: {
        ...state.orders,
        [o.id]: o,
      }
    }
  },

  declareEvent: (instance = {}, aoHost, eName, path) => {
    const { state = {} } = instance
    const { ev } = state
    ev.on(eName, aoHost.onAOSelfEvent.bind(aoHost, instance, path)
  }
})
