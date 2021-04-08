'use strict'

const Promise = require('bluebird')
const Debug = require('debug')

const MAX_SUBMIT_ATTEMPTS = 10

/**
 * Generates a set of helpers to be used during algo order execution; these
 * helpers are saved on the AO instance and provided to all event handlers.
 *
 * @param {object} state - algo order instance state
 * @param {object} adapter - exchange adapter
 * @returns {object} helpers
 * @private
 */
const genHelpers = (state = {}, adapter) => {
  const { id, gid } = state
  let pendingTimeouts = []
  const debug = Debug(`bfx:hf:algo:${id}:${gid}`)
  const logHelperCall = (fmt, ...data) => {
    const { DEBUG_TRACE } = process.env

    if (DEBUG_TRACE) {
      const { stack } = new Error()
      debug(`${fmt} [%s]`, ...data, stack.split('\n')[3].trim())
    } else {
      debug(fmt, ...data)
    }
  }

  /**
   * @module Helpers
   *
   * @description
   * ### AO Event Handlers & Helpers
   * All event handlers receive the same arguments: `(instance = {}, ...args)`.
   * The instance contains two objects, `{ state = {}, h = {} }` with `state`
   * being the current AO state, and `h` being a helper object.
   *
   * The provided helpers are:
   * * `clearAllTimeouts()` - clears all pending order submit/cancel timeouts
   *
   * * `debug(str, ...args)` - for logging information to the console, tagged
   *   by AO GID
   *
   * * `emitSelf(eventName, ...args)` - triggers an event on the 'self' section
   *
   * * `emit(eventName, ...args)` - raw event emitter, i.e. `emit('life:start')`
   *
   * * `notifyUI(level, message)` - generates and sends a notification which
   *   appears on the Bitfinex UI
   *
   * * `cancelOrder(state, order)` - takes current algo state and cancels the
   *   provided order
   *
   * * `submitOrderWithDelay(state, delay, order)` - takes current algo state,
   *   submits a new order, delay in ms
   *
   * * `declareEvent(instance, host, eventName, path)` - declares an internal
   *   AO event, see section below
   *
   * * `declareChannel(instance, host, channel, filter)` - declares a required
   *   data channel, see section below
   *
   * * `updateState(instance, update)` - update the current state for an AO
   *   instance
   */
  return {
    /**
     * Clear all timeouts for pending order submits/cancellations, called
     * automatically by the algo host on teardown.
     */
    clearAllTimeouts: () => {
      pendingTimeouts.forEach((timeoutObject) => {
        if (timeoutObject.t !== null) {
          clearTimeout(timeoutObject.t)
          timeoutObject.t = null
        }
      })

      pendingTimeouts = []
    },

    timeout: (ms) => {
      let id = null

      const p = new Promise((resolve) => {
        id = setTimeout(resolve, ms)
      })

      return [id, () => p]
    },

    /**
     * Logs a string to the console, tagged by AO id/gid
     *
     * @param {string} str - format string
     * @param {...any} args - passed to debug()
     * @example
     * debug('submitting order %s in %dms', order.toString(), delay)
     */
    debug: (str, ...args) => {
      debug(str, ...args)
    },

    /**
     * Triggeres an event on the 'self' section
     *
     * @param {string} eventName - name of event to emit
     * @param {...any} eventArgs - args passed to all handlers
     * @returns {Promise} p - resolves when all handlers complete
     * @example
     * await emitSelf('submit_orders')
     */
    emitSelf: async (eventName, ...eventArgs) => {
      logHelperCall('emitSelf: %s', eventName)
      return state.ev.emit(`self:${eventName}`, ...eventArgs)
    },

    /**
     * Triggers a generic event
     *
     * @param {string} eventName - name of event to emit
     * @param {...any} eventArgs - args passed to all handlers
     * @returns {Promise} p - resolves when all handlers complete
     * @example
     * await emit('exec:order:submit:all', gid, [order], submitDelay)
     */
    emit: async (eventName, ...eventArgs) => {
      logHelperCall('emit %s', eventName)
      return state.ev.emit(eventName, ...eventArgs)
    },

    /**
     * Triggers an UI notification, sent out via the active websocket connection
     *
     * @param {string} level - 'info', 'success', 'error', 'warning'
     * @param {string} message - notification content
     * @returns {Promise} p - resolves when all handlers complete
     * @example
     * await notifyUI('info', `Scheduled tick in ${delay}s`)
     */
    notifyUI: async (level, message) => {
      logHelperCall('notify %s: %s', level, message)
      await state.ev.emit('notify', gid, level, message)
    },

    /**
     * Cancels the provided order instantly, and removes it from the active
     * order set.
     *
     * @param {object} state - current AO instance state
     * @param {object} order - order model or array
     * @returns {object} nextState
     * @example
     * await cancelOrder(state, order)
     */
    cancelOrder: async (state = {}, order) => {
      logHelperCall('cancelOrder: %s', order.toString())

      const { connection, orders = {} } = state
      const {
        [order.cid + '']: knownOrder, // eslint-disable-line
        ...otherOrders
      } = orders

      // NOTE: No await, in order to update cancelled order set immediately
      adapter.cancelOrder(connection, order).then((order) => { // eslint-disable-line
        debug(
          'order successfully cancelled (id: %s, cid: %s): %s %f @ %f',
          order.id, order.cid, order.type, order.amountOrig, order.price
        )
      }).catch((notification) => {
        debug(
          'received error while canceling order(id: %s, cid: %s): %s %f @ %f [ERROR: %O]',
          order.id, order.cid, order.type, order.amountOrig, order.price, notification
        )
      })

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
     * Submits an order after a delay, and adds it to the active order set on
     * the AO state. Emits errors if the order fails to submit; retries up to
     * MAX_SUBMIT_ATTEMPTS in the case of balance evaluation errors.
     *
     * @param {object} state - current AO instance state
     * @param {number} delay - delay in milliseconds
     * @param {object} order - order model
     * @param {number} attempt - attempt count, max is 10 (set as a constant)
     * @returns {object} nextState
     * @example
     * await submitOrderWithDelay(state, 100, order)
     */
    submitOrderWithDelay: async (state = {}, delay, order, attempt = 1) => {
      logHelperCall(
        'submitOrderWithDelay (%dms, attempt %d): %s',
        delay, attempt, order.toString()
      )

      if (attempt > MAX_SUBMIT_ATTEMPTS) { // note state assumed already patched
        return state
      }

      const { connection } = state
      const orderPatch = {
        [order.cid + '']: order
      }

      // Note that we don't wait for the order to submit here, since it might
      // fill immediately triggering a fill event before we patch the state
      // orders/allOrders objects
      await adapter.submitOrderWithDelay(connection, delay, order).then((order) => { // eslint-disable-line
        debug(
          'order successfully submitted: %s %f @ %f %s',
          order.type, order.amountOrig, order.price, order.status
        )
      }).catch(async (notification) => {
        const text = notification.text || notification

        debug('%s', text)

        if (/minimum size/.test(text)) {
          await state.ev.emit('error:minimum_size', gid, order, { text })
        } else if (/balance/.test(text)) {
          await state.ev.emit('error:insufficient_balance', gid, order, { text })
        } else if (/evaluate/.test(text)) {
          if (attempt === MAX_SUBMIT_ATTEMPTS) {
            await state.ev.emit('error:evaluate_balance', gid, order, { text })
          } else {
            const retryDelay = Math.max(500, delay + 250) // min 0.5s, increasing

            await adapter.submitOrderWithDelay(connection, retryDelay, order)
          }
        } else {
          await state.ev.emit('error:unknown_error', gid, order, { text })
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
     * @param {object} instance - full AO instance, with state/h
     * @param {object} aoHost - algo host instance
     * @param {string} eventName - name of event to declare
     * @param {string} path - on the 'self' section
     * @example
     * declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
     */
    declareEvent: (instance = {}, aoHost, eventName, path) => {
      const { state = {} } = instance
      const { ev } = state
      const handler = aoHost.onAOSelfEvent.bind(aoHost, instance, path)

      logHelperCall('declareEvent: %s target %s', eventName, path)

      ev.on(eventName, handler)
    },

    /**
     * Assigns a data channel to the provided AO instance
     *
     * @param {object} instance - full AO instance, with state/h
     * @param {object} aoHost - unused, here for common signature
     * @param {string} channel - channel name, i.e. 'ticker'
     * @param {object} filter - channel spec, i.e. { symbol: 'tBTCUSD' }
     * @returns {object} nextState
     * @example
     * await declareChannel(instance, host, 'trades', { symbol })
     */
    declareChannel: async (instance = {}, aoHost, channel, filter) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      logHelperCall(
        'declareChannel: %s filter %s', channel,
        Object.keys(filter).map(k => `${k}=${filter[k]}`).join(', ')
      )

      await emit('channel:assign', gid, channel, filter)

      return instance.state // updated ref
    },

    /**
     * Updates the state for the provided AO instance
     *
     * @param {object} instance - full AO instance, with state/h
     * @param {object} update - new state
     * @returns {object} nextState
     * @example
     * await updateState(instance, { remainingAmount })
     */
    updateState: async (instance = {}, update = {}) => {
      const { h = {}, state = {} } = instance
      const { gid } = state
      const { emit } = h

      logHelperCall('updateState')
      await emit('state:update', gid, update)

      return instance.state // updated ref
    }
  }
}

module.exports = genHelpers
