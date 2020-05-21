'use strict'

const defineAlgoOrder = require('../define_algo_order')
const validateParams = require('./meta/validate_params')
const genPreview = require('./meta/gen_preview')
const processParams = require('./meta/process_params')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const initState = require('./meta/init_state')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')
const genOrderLabel = require('./meta/gen_order_label')

/**
 * Ping/pong submits multiple 'ping' orders; once a ping order fills, an
 * associated 'pong' order is submitted.
 *
 * Multiple ping/pong pairs can be created by specifying an order count greater
 * than 1, a suitable min/max ping price, and a pong distance. Multiple ping
 * orders will be created between the specified min/max prices, with the
 * associated pongs offset by the pong distance from the ping price.
 *
 * When operating in 'endless' mode, new ping orders will be submitted when
 * their associated pongs fill.
 *
 * @module module:bfx-hf-algo/PingPong
 * @param {boolean} endless - if enabled, pong fill will trigger a new ping
 * @param {string} symbol - symbol to trade on
 * @param {number} amount - individual ping/pong order amount
 * @param {number} orderCount - number of ping/pong pairs to create, 1 or more
 * @param {number} [pingPrice] - used for a single ping/pong pair
 * @param {number} [pongPrice] - used for a single ping/pong pair
 * @param {number} [pingMinPrice] - minimum price for ping orders
 * @param {number} [pingMaxPrice] - maximum price for ping orders
 * @param {number} [pongDistance] - pong offset from ping orders for multiple pairs
 *
 * @example
 * await host.startAO('bfx-ping_pong', {
 *   symbol: 'tBTCUSD',
 *   amount: 0.5,
 *   orderCount: 5,
 *   pingMinPrice: 6000,
 *   pingMaxPrice: 6700,
 *   pongDistance: 300,
 *   submitDelay: 150,
 *   cancelDelay: 150,
 *   _margin: false,
 * })
 */
const PingPong = defineAlgoOrder({
  id: 'bfx-ping_pong',
  name: 'Ping/Pong',

  meta: {
    genOrderLabel,
    validateParams,
    processParams,
    genPreview,
    initState,
    getUIDef,
    serialize,
    unserialize
  },

  events: {
    life: {
      start: onLifeStart,
      stop: onLifeStop
    },

    orders: {
      order_fill: onOrdersOrderFill,
      order_cancel: onOrdersOrderCancel
    }
  }
})

module.exports = PingPong
