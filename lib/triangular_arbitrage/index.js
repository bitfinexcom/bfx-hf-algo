'use strict'

// meta
const defineAlgoOrder = require('../define_algo_order')
const validateParams = require('./meta/validate_params')
const genPreview = require('./meta/gen_preview')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')
const genOrderLabel = require('./meta/gen_order_label')

// events
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataManagedBook = require('./events/data_managed_book')

/**
 * Triangular arbitrage attempts to profit from the small differences in price
 * between multiple markets. It submits a series of synchronous orders that
 * execute on 3 different markets and end up back to the starting symbol thus
 * creating a triangle pattern. For example:
 * EOS:BTC (buy) -> EOS:ETH (sell) -> ETH:BTC (sell)
 *
 * Once the EOS:BTC buy order fills then a new order is executed on EOS:ETH to sell the EOS
 * and finally, once that order is filled a sell order is placed on the ETH:BTC market in order
 * to complete the full cycle back to BTC.
 *
 * The user is able to specify whether the orders execute as a taker or a maker by selecting
 * the order types 'MARKET', 'BEST ASK' or 'BEST BID'
 *
 * @name PingPong
 * @param {boolean} limit - if enabled all orders will be placed at best bid/ask
 * @param {string} symbol1 - starting market
 * @param {string} symbol2 - intermediate market
 * @param {string} symbol3 - final market
 * @param {number} amount - order size
 */
module.exports = defineAlgoOrder({
  id: 'bfx-triangular_arbitrage',
  name: 'Triangular Arbitrage',

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
    },

    data: {
      managedBook: onDataManagedBook
    }
  }
})
