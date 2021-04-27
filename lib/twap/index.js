'use strict'

const defineAlgoOrder = require('../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfIntervalTick = require('./events/self_interval_tick')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataManagedBook = require('./events/data_managed_book')
const onDataTrades = require('./events/data_trades')
const genOrderLabel = require('./meta/gen_order_label')
const getUIDef = require('./meta/get_ui_def')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const declareChannels = require('./meta/declare_channels')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')
const config = require('./config')

/**
 * @module TWAP
 * @param {string} symbol - symbol to trade on
 * @param {number} amount - total order amount
 * @param {number} sliceAmount - individual slice order amount
 * @param {number} priceDelta - max acceptable distance from price target
 * @param {string} [priceCondition] - MATCH_LAST, MATCH_SIDE, MATCH_MID
 * @param {number|string} priceTarget - numeric, or OB_SIDE, OB_MID, LAST
 * @param {boolean} tradeBeyondEnd - if true, slices are not cancelled after their interval expires
 * @param {string} orderType - LIMIT or MARKET
 * @param {boolean} _margin - if false, order type is prefixed with EXCHANGE
 *
 * @example
 * await host.startAO('bfx-twap', {
 *   symbol: 'tBTCUSD',
 *   amount: -0.5,
 *   sliceAmount: -0.1,
 *   sliceInterval: 10,
 *   amountDistortion: 0.20, // %
 *   priceDelta: 100, // max distance from price target to fulfill condition
 *   priceTarget: 16650,
 *   priceCondition: TWAP.Config.PRICE_COND.MATCH_LAST,
 *   tradeBeyondEnd: false,
 *   orderType: 'LIMIT',
 *   _margin: false
 * })
 */
const TWAP = defineAlgoOrder({
  id: 'bfx-twap',
  name: 'TWAP',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    declareChannels,
    genOrderLabel,
    genPreview,
    initState,
    getUIDef,
    serialize,
    unserialize
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop
    },

    orders: {
      order_fill: onOrdersOrderFill,
      order_cancel: onOrdersOrderCancel
    },

    data: {
      managedBook: onDataManagedBook,
      trades: onDataTrades
    }
  }
})

TWAP.Config = config

module.exports = TWAP
