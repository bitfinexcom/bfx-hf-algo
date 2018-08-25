'use strict'

const defineAlgoOrder = require('../../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfIntervalTick = require('./events/self_interval_tick')
const onSelfSubmitOrders = require('./events/self_submit_orders')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onDataBook = require('./events/data_book')
const onDataTrades = require('./events/data_trades')
const getOrderLabel = require('./meta/get_order_label')
// const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const subscribeChannels = require('./meta/declare_channels')

module.exports = defineAlgoOrder({
  id: 'bfx.twap',
  name: 'TWAP',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    subscribeChannels,
    getOrderLabel,
    // genPreview,
    initState,
  },

  events: {
    self: {
      interval_tick: onSelfIntervalTick,
      submit_orders: onSelfSubmitOrders,
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
      book: onDataBook,
      trades: onDataTrades,
    }
  }
})
