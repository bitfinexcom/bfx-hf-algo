'use strict'

const genOrders = require('../util/generate_orders')

// Already passed through validate/process methods
module.exports = (state = {}) => {
  return genOrders(state)
}
