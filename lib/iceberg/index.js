'use strict'

const defineAlgoOrder = require('../define_algo_order')
const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfSubmitOrders = require('./events/self_submit_orders')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')
const genOrderLabel = require('./meta/gen_order_label')

/**
 * @module Iceberg
 * @param {string} symbol - symbol to trade on
 * @param {number} amount - total order amount
 * @param {number} sliceAmount - iceberg slice order amount
 * @param {number} [sliceAmountPerc] - optional, slice amount as % of total amount
 * @param {boolean} excessAsHidden - whether to submit remainder as a hidden order
 * @param {string} orderType - LIMIT or MARKET
 * @param {number} [submitDelay] - in ms, default 1500
 * @param {boolean} [_margin] - if false, prefixes order type with EXCHANGE
 *
 * @example
 * await host.startAO('bfx-iceberg', {
 *   symbol: 'tBTCUSD',
 *   price: 21000,
 *   amount: -0.5,
 *   sliceAmount: -0.1,
 *   excessAsHidden: true,
 *   orderType: 'LIMIT',
 *   submitDelay: 150,
 *   _margin: false,
 * })
 */
const Iceberg = defineAlgoOrder({
  id: 'bfx-iceberg',
  name: 'Iceberg',

  meta: {
    genOrderLabel,
    validateParams,
    processParams,
    declareEvents,
    genPreview,
    initState,
    getUIDef,
    serialize,
    unserialize
  },

  events: {
    self: {
      submit_orders: onSelfSubmitOrders
    },

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

module.exports = Iceberg
