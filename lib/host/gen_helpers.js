'use strict'

const Promise = require('bluebird')
const PI = require('p-iteration')
const Debug = require('debug')

const MAX_SUBMIT_ATTEMPTS = 10

/**
 * Generates a set of helpers to be used during algo order execution; these
 * helpers are saved on the AO instance and provided to all event handlers.
 *
 * @param {Object} state - algo order instance state
 * @return {Object} helpers
 */
module.exports = (state = {}, adapter) => {
  const { id, gid } = state
  const debug = Debug(`bfx:hf:algo:${id}:${gid}`)

  return {

    /**
     * Logs a string to the console, tagged by AO id/gid
     *
     * @param {string} str
     * @param {...any} args
     */
    debug: (str, ...args) => {
      debug(str, ...args)
    },

    /**
     * Triggeres an event on the 'self' section
     *
     * @example await emitSelf('submit_orders')
     *
     * @param {string} eventName
     * @param {...any} eventArgs
     */
    emitSelf: async (eventName, ...eventArgs) => {
      debug('emit self:%s', eventName)
      await state.ev.emit(`self:${eventName}`, ...eventArgs)
    },

    /**
     * Like `emitSelf` but operates after a timeout
     *
     * @param {string} eventName
     * @param {...any} eventArgs
     */
    emitSelfAsync: async (eventName, ...eventArgs) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          debug('emit self:%s', eventName)

          state.ev
            .emit(`self:${eventName}`, ...eventArgs)
            .then(resolve)
            .catch(reject)
        }, 0)
      })
    },

    /**
     * Triggers a generic event
     *
     * @example await emit('exec:order:submit:all', gid, [order], submitDelay)
     *
     * @param {string} eventName
     * @param {...any} eventArgs
     */
    emit: async (eventName, ...eventArgs) => {
      debug('emit %s', eventName)
      await state.ev.emit(eventName, ...eventArgs)
    },

    /**
     * Like `emit` but operates after a timeout
     *
     * @param {string} eventName
     * @param {...any} eventArgs
     */
    emitAsync: async (eventName, ...eventArgs) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          debug('emit %s', eventName)

          state.ev
            .emit(eventName, ...eventArgs)
            .then(resolve)
            .catch(reject)
        }, 0)
      })
    },

    /**
     * Triggers an UI notification, sent out via the active websocket connection
     *
     * @example await notifyUI('info', `Scheduled tick in ${delay}s`)
     *
     * @param {string} level - 'info', 'success', 'error', 'warning'
     * @param {string} message - notification content
     */
    notifyUI: async (level, message) => {
      debug('notify %s: %s', level, message)
      await state.ev.emit('notify', gid, level, message)
    },

    /**
     * Cancels the provided order after a delay, and removes it from the active
     * order set.
     *
     * @param {Object} state - current AO instance state
     * @param {number} delay - in ms
     * @param {Order} order
     * @return {Object} nextState
     */
    cancelOrderWithDelay: async (state = {}, delay, order) => {
      const { connection, orders = {} } = state
      const {
        [order.cid + '']: knownOrder,
        ...otherOrders
      } = orders

      // NOTE: No await, in order to update cancelled order set immediately
      adapter.cancelOrderWithDelay(connection, delay, order)

      return {
        ...state,
        orders: otherOrders,
        cancelledOrders: {
          ...state.cancelledOrders,
          [order.cid + '']: order
        }
      }
    },

    /**
     * Cancels all orders currently on the AO state after the specified delay
     *
     * @param {Object} state - current AO instance state
     * @param {number} delay - in ms
     * @return {Object} nextState
     */
    cancelAllOrdersWithDelay: async (state = {}, delay) => {
      const { orders = {}, connection } = state

      // NOTE: No await, in order to update cancelled order set immediately
      PI.map(Object.values(orders), async (o) => {
        return adapter.cancelOrderWithDelay(connection, delay, o)
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

    /**
     * Submits an order after a delay, and adds it to the active order set on
     * the AO state. Emits errors if the order fails to submit; retries up to
     * MAX_SUBMIT_ATTEMPTS in the case of balance evaluation errors.
     *
     * @param {Object} state - current AO instance state
     * @param {number} delay
     * @param {Order} order
     * @param {number} attempt - attempt count, max is 10 (set as a constant)
     * @return {Object} nextState
     */
    submitOrderWithDelay: async (state = {}, delay, o, attempt = 1) => {
      if (attempt > MAX_SUBMIT_ATTEMPTS) { // note state assumed already patched
        return state
      }

      const { connection } = state
      const orderPatch = {
        [o.cid + '']: o
      }

      // Note that we don't wait for the order to submit here, since it might
      // fill immediately triggering a fill event before we patch the state
      // orders/allOrders objects
      adapter.submitOrderWithDelay(connection, delay, o).then((order) => {
        debug(
          'order successfully submitted: %s %f @ %f %s',
          order.type, order.amountOrig, order.price, order.status
        )
      }).catch(async (notification) => {
        const text = notification.text || notification

        debug('%s', text)

        if (/minimum size/.test(text)) {
          await state.ev.emit('error:minimum_size', gid, o, { text })
        } else if (/balance/.test(text)) {
          await state.ev.emit('error:insufficient_balance', gid, o, { text })
        } else if (/evaluate/.test(text)) {
          if (attempt === MAX_SUBMIT_ATTEMPTS) {
            await state.ev.emit('error:evaluate_balance', gid, o, { text })
          } else {
            const retryDelay = Math.max(500, delay + 250) // min 0.5s, increasing

            await adapter.submitOrderWithDelay(connection, retryDelay, o)
          }
        }
      })

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

    /**
     * Hooks up the listener for a new event on the 'self' section
     *
     * @example declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
     *
     * @param {Object} instance - full AO instance, with state/h
     * @param {Object} aoHost
     * @param {string} eventName
     * @param {string} path - on the 'self' section
     */
    declareEvent: (instance = {}, aoHost, eventName, path) => {
      const { state = {} } = instance
      const { ev } = state
      const handler = aoHost.onAOSelfEvent.bind(aoHost, instance, path)

      ev.on(eventName, handler)
    },

    /**
     * Assigns a data channel to the provided AO instance
     *
     * @example await declareChannel(instance, host, 'trades', { symbol })
     *
     * @param {Object} instance - full AO instance, with state/h
     * @param {Object} aoHost
     * @param {string} channel - channel name, i.e. 'ticker'
     * @param {Object} filter - channel spec, i.e. { symbol: 'tBTCUSD' }
     * @return {Object} nextState
     */
    declareChannel: async (instance = {}, aoHost, channel, filter) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('channel:assign', gid, channel, filter)

      return instance.state // updated ref
    },

    /**
     * Updates the state for the provided AO instance
     *
     * @param {Object} instance - full AO instance, with state/h
     * @param {Object} update - new state
     * @return {Object} nextState
     */
    updateState: async (instance = {}, update = {}) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      await emit('state:update', gid, update)

      return instance.state // updated ref
    }
  }
}
