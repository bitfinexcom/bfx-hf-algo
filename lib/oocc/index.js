'use strict'

const defineAlgoOrder = require('../define_algo_order')

const onDataManagedCandles = require('./events/data_managed_candles')
const onSelfSubmitOrder = require('./events/self_submit_order')
const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const declareChannels = require('./meta/declare_channels')
const initState = require('./meta/init_state')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const genOrderLabel = require('./meta/gen_order_label')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')

/**
 * TODO
 */
const OOCC = defineAlgoOrder({
  id: 'bfx-oocc',
  name: 'Order on Candle Close',

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
    data: {
      managed_candles: onDataManagedCandles
    },

    self: {
      submit_order: onSelfSubmitOrder
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop
    }
  }
})

module.exports = OOCC
