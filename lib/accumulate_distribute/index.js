'use strict'

const defineAlgoOrder = require('../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfIntervalTick = require('./events/self_interval_tick')
const onSelfSubmitOrder = require('./events/self_submit_order')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataManagedBook = require('./events/data_managed_book')
const onDataManagedCandles = require('./events/data_managed_candles')
const onDataTrades = require('./events/data_trades')
const genOrderLabel = require('./meta/gen_order_label')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const declareChannels = require('./meta/declare_channels')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')

/**
 * @module AccumulateDistribute
 * @param {string} symbol - symbol to trade on
 * @param {number} amount - total order amount
 * @param {number} sliceAmount - individual slice order amount
 * @param {number} sliceInterval - delay in ms between slice orders
 * @param {number} [intervalDistortion] - slice interval distortion in %, default 0
 * @param {number} [amountDistortion] - slice amount distortion in %, default 0
 * @param {string} orderType - LIMIT, MARKET, RELATIVE
 * @param {number} [limitPrice] - price for LIMIT orders
 * @param {boolean} catchUp - if true, interval will be ignored if behind with filling slices
 * @param {boolean} awaitFill - if true, slice orders will be kept open until filled
 * @param {object} [relativeOffset] - price reference for RELATIVE orders
 * @param {string} [relativeOffset.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [relativeOffset.delta] - offset distance from price reference
 * @param {number[]} [relativeOffset.args] - MA or EMA indicator arguments [period]
 * @param {string} [relativeOffset.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [relativeOffset.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
 * @param {object} [relativeCap] - maximum price reference for RELATIVE orders
 * @param {string} [relativeCap.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [relativeCap.delta] - cap distance from price reference
 * @param {number[]} [relativeCap.args] - MA or EMA indicator arguments [period]
 * @param {string} [relativeCap.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [relativeCap.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
 * @param {boolean} _margin - if false, order type is prefixed with EXCHANGE
 *
 * @example
 * await host.startAO('bfx-accumulate_distribute', {
 *   symbol: 'tBTCUSD',
 *   amount: -0.2,
 *   sliceAmount: -0.1,
 *   sliceInterval: 10000,
 *   intervalDistortion: 0.20, // %
 *   amountDistortion: 0.20, // %
 *   orderType: 'RELATIVE', // MARKET, LIMIT, RELATIVE
 *   offsetType: 'ask',
 *   offsetDelta: -10,
 *   capType: 'bid',
 *   capDelta: 10,
 *   submitDelay: 150,
 *   cancelDelay: 150,
 *   catchUp: true, // if true & behind, ignore slice interval (after prev fill)
 *   awaitFill: true, // await current slice fill before continuing to next slice
 *   _margin: false,
 * })
 */
const AccumulateDistribute = defineAlgoOrder({
  id: 'bfx-accumulate_distribute',
  name: 'Accumulate/Distribute',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    declareChannels,
    getUIDef,
    genOrderLabel,
    genPreview,
    initState,
    serialize,
    unserialize
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick,
      submit_order: onSelfSubmitOrder
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
      managedCandles: onDataManagedCandles,
      managedBook: onDataManagedBook,
      trades: onDataTrades
    }
  }
})

module.exports = AccumulateDistribute
