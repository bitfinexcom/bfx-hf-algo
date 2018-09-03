'use strict'

const defineAlgoOrder = require('../../define_algo_order')

// const validateParams = require('./meta/validate_params')
// const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfIntervalTick = require('./events/self_interval_tick')
const onSelfSubmitOrder = require('./events/self_submit_order')
const onLifeStart = require('./events/life_start')
// const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
// const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataManagedBook = require('./events/data_managed_book')
const onDataManagedCandles = require('./events/data_managed_candles')
const onDataTrades = require('./events/data_trades')
// const getOrderLabel = require('./meta/get_order_label')
// const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const declareChannels = require('./meta/declare_channels')
// const config = require('./config')

const AccumulateDistribute = defineAlgoOrder({
  id: 'bfx.accumulate_distribute',
  name: 'Accumulate/Distribute',

  meta: {
    // validateParams,
    // processParams,
    declareEvents,
    declareChannels,
    // getOrderLabel,
    // genPreview,
    initState
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick,
      submit_order: onSelfSubmitOrder
    },

    life: {
      start: onLifeStart,
      // stop: onLifeStop
    },

    orders: {
      order_fill: onOrdersOrderFill,
      // order_cancel: onOrdersOrderCancel
    },

    data: {
      managedCandles: onDataManagedCandles,
      managedBook: onDataManagedBook,
      trades: onDataTrades
    }
  }
})

module.exports = AccumulateDistribute
