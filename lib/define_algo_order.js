'use strict'

const _isObject = require('lodash/isObject')
const defaultOrderErrorHandler = require('./default_handlers/orders_order_error')
const defaultErrorInsufficientBalanceHandler = require('./default_handlers/error_insufficient_balance')
const defaultErrorMinimumSizeHandler = require('./default_handlers/error_minimum_size')

/**
 * Attaches default handlers if not supplied & returns the algo order definition
 *
 * @param {Object} definition
 * @return {Object} ao
 */
module.exports = (def = {}) => {
  const { events } = def

  if (!_isObject(events)) {
    throw new Error('algo definition defines no events')
  } else if (!_isObject(events.orders)) {
    throw new Error('algo definition defines no order events')
  }

  if (!events.orders.order_error) { // estlint-disable-line
    events.orders.order_error = defaultOrderErrorHandler // eslint-disable-line
  }

  if (!events.errors) {
    events.errors = {}
  }

  if (!events.errors.minimum_size) {
    events.errors.minimum_size = defaultErrorMinimumSizeHandler
  }

  if (!events.errors.insufficient_balance) {
    events.errors.insufficient_balance = defaultErrorInsufficientBalanceHandler
  }

  return def
}
