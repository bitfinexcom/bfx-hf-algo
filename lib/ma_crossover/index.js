'use strict'

const defineAlgoOrder = require('../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfSubmitOrder = require('./events/self_submit_order')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataManagedCandles = require('./events/data_managed_candles')
const genOrderLabel = require('./meta/gen_order_label')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const declareChannels = require('./meta/declare_channels')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')

/**
 * @module MACrossover
 * @param {string} symbol - symbol to trade on
 * @param {string} orderType - LIMIT or MARKET
 * @param {number} orderPrice - price for order if `orderType` is LIMIT
 * @param {number} amount - total order amount
 * @param {boolean} _margin - if false, order type is prefixed with EXCHANGE
 * @param {string} shortType - MA or EMA
 * @param {string} [shortEMATF] - candle time frame for short EMA signal
 * @param {number} [shortEMAPeriod] - cadnel period for short EMA signal
 * @param {string} [shortEMAPrice] - candle price key for short EMA signal
 * @param {string} [shortMATF] - candle time frame for short MA signal
 * @param {number} [shortMAPeriod - cadnel period for short MA signal
 * @param {string} [shortMAPrice] - candle price key for short MA signal
 * @param {string} longType - MA or EMA
 * @param {string} [longEMATF] - candle time frame for long EMA signal
 * @param {number} [longEMAPeriod] - cadnel period for long EMA signal
 * @param {string} [longEMAPrice] - candle price key for long EMA signal
 * @param {string} [longMATF] - candle time frame for long MA signal
 * @param {number} [longMAPeriod] - cadnel period for long MA signal
 * @param {string} [longMAPrice] - candle price key for long MA signal
 * @returns {object} def
 *
 * @example
 * await host.startAO('bfx-ma_crossover', {
 *   shortType: 'EMA',
 *   shortEMATF: '1m',
 *   shortEMAPeriod: '20',
 *   shortEMAPrice: 'close',
 *   longType: 'EMA',
 *   longEMATF: '1m',
 *   longEMAPeriod: '100',
 *   longEMAPrice: 'close',
 *   amount: 1,
 *   symbol: 'tEOSUSD',
 *   orderType: 'MARKET',
 *   action: 'Buy',
 *   _margin: false,
 * })
 * */
const MACrossover = defineAlgoOrder({
  id: 'bfx-ma_crossover',
  name: 'MA Crossover',

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
      submit_order: onSelfSubmitOrder
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop
    },

    orders: {
      order_cancel: onOrdersOrderCancel
    },

    data: {
      managedCandles: onDataManagedCandles
    }
  }
})

module.exports = MACrossover
