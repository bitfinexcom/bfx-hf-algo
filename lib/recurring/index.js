const getUIDef = require('./meta/get_ui_def')
const defineAlgoOrder = require('../define_algo_order')
const validateParams = require('./meta/validate_params')
const processParams = require('./meta/process_params')
const genOrderLabel = require('./meta/gen_order_label')

const Recurring = defineAlgoOrder({
  id: 'bfx-recurring',
  name: 'Recurring',

  meta: {
    validateParams,
    processParams,
    genOrderLabel,
    getUIDef
  },

  events: {
    orders: {}
  }
})

module.exports = Recurring
