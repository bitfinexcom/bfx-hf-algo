'use strict'

const defineAlgoOrder = require('../../define_algo_order')

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
const getOrderLabel = require('./meta/get_order_label')
// const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const declareChannels = require('./meta/declare_channels')
const config = require('./config')

const TWAP = defineAlgoOrder({
  id: 'bfx.twap',
  name: 'TWAP',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    declareChannels,
    getOrderLabel,
    // genPreview,
    initState,
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick,
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop,
    },

    orders: {
      order_fill: onOrdersOrderFill,
      order_cancel: onOrdersOrderCancel,
    },

    data: {
      managedBook: onDataManagedBook,
      trades: onDataTrades,
    }
  }
})

TWAP.Config = config

module.exports = TWAP
