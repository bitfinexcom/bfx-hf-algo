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
      order_cancel: onOrdersOrderCancel,
    },

    data: {
      managedCandles: onDataManagedCandles,
    },
  }
})

module.exports = MACrossover
