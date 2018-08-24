'use strict'

const defineAlgoOrder = require('../../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfSubmitOrders = require('./events/self_submit_orders')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderFill = require('./events/orders_order_fill')
const getOrderLabel = require('./meta/get_order_label')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const save = require('./meta/save')
const load = require('./meta/load')

module.exports = defineAlgoOrder({
  id: 'bfx.iceberg',
  name: 'Iceberg',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    getOrderLabel,
    genPreview,
    initState,
    save,
    load,
  },

  events: {
    self: {
      submit_orders: onSelfSubmitOrders,
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop,
    },

    orders: {
      order_fill: onOrdersOrderFill,
    }
  }
})
