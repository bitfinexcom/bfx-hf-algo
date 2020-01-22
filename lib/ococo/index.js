'use strict'

const defineAlgoOrder = require('../define_algo_order')

const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const initState = require('./meta/init_state')
const onSelfSubmitInitialOrder = require('./events/self_submit_initial_order')
const onSelfSubmitOCOOrder = require('./events/self_submit_oco_order')
const onLifeStart = require('./events/life_start')
const onLifeStop = require('./events/life_stop')
const onOrdersOrderCancel = require('./events/orders_order_cancel')
const onOrdersOrderFill = require('./events/orders_order_fill')
const genOrderLabel = require('./meta/gen_order_label')
const genPreview = require('./meta/gen_preview')
const declareEvents = require('./meta/declare_events')
const getUIDef = require('./meta/get_ui_def')
const serialize = require('./meta/serialize')
const unserialize = require('./meta/unserialize')

const OCOCO = defineAlgoOrder({
  id: 'bfx-ococo',
  name: 'OCOCO',

  meta: {
    validateParams,
    processParams,
    declareEvents,
    getUIDef,
    genOrderLabel,
    genPreview,
    initState,
    serialize,
    unserialize
  },

  events: {
    self: {
      submit_initial_order: onSelfSubmitInitialOrder,
      submit_oco_order: onSelfSubmitOCOOrder
    },

    life: {
      start: onLifeStart,
      stop: onLifeStop
    },

    orders: {
      order_cancel: onOrdersOrderCancel,
      order_fill: onOrdersOrderFill
    }
  }
})

module.exports = OCOCO
