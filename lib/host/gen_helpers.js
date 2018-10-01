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

    notifyUI: async (level, message) => {
      debug('notify %s: %s', level, message)
      await state.ev.emit('notify', gid, level, message)
    },

    cancelOrderWithDelay: async (state = {}, delay, o) => {
      const { ws, orders = {} } = state
      const {
        [o.cid + '']: knownOrder,
        ...otherOrders
      } = orders

      // NOTE: No await, in order to update cancelled order set immediately
      cancelOrderWithDelay(ws, delay, o)

      return {
        ...state,
        orders: otherOrders,
        cancelledOrders: {
          ...state.cancelledOrders,
          [o.cid + '']: o
        }
      }
    },

    cancelAllOrdersWithDelay: async (state = {}, delay) => {
      const { orders = {}, ws } = state

      // NOTE: No await, in order to update cancelled order set immediately
      PI.map(Object.values(orders), async (o) => {
        return cancelOrderWithDelay(ws, delay, o)
      })

      return {
        ...state,

        orders: {},
        cancelledOrders: {
          ...state.cancelledOrders,
          ...orders
        }
      }
    },

    submitOrderWithDelay: async (state = {}, delay, o) => {
      const { ws } = state
      const orderPatch = {}

      try {
        const order = await submitOrderWithDelay(ws, delay, o)
        orderPatch[o.cid + ''] = order
      } catch (notification) {
        debug('%s', notification.text)
      }

      return {
        ...state,

        allOrders: { // track beyond close
          ...state.allOrders,
          ...orderPatch
        },

        orders: {
          ...state.orders,
          ...orderPatch
        }
      }
    },

    declareEvent: (instance = {}, aoHost, eName, path) => {
      const { state = {} } = instance
      const { ev } = state
      const handler = aoHost.onAOSelfEvent.bind(aoHost, instance, path)

      ev.on(eName, handler)
    },

    declareChannel: async (instance = {}, aoHost, channel, filter) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('channel:assign', gid, channel, filter)

      return instance.state // updated ref
    },

    updateState: async (instance = {}, update = {}) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('state:update', gid, update)

      return instance.state // updated ref
    }

    /* // unused, see declareChannel() & co
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
    */
  }
}
