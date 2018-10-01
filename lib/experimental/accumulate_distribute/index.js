'use strict'

const defineAlgoOrder = require('../../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfIntervalTick = require('./events/self_interval_tick')
const onSelfSubmitOrder = require('./events/self_submit_order')
const onLifeStart = require('./events/life_start')
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

const AccumulateDistribute = defineAlgoOrder({
  id: 'bfx.accumulate_distribute',
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
    unserialize,
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick,
      submit_order: onSelfSubmitOrder,
    },

    life: {
      start: onLifeStart,
    },

    orders: {
      order_fill: onOrdersOrderFill,
      order_cancel: onOrdersOrderCancel,
    },

    data: {
      managedCandles: onDataManagedCandles,
      managedBook: onDataManagedBook,
      trades: onDataTrades,
    }
  }
})

module.exports = AccumulateDistribute
