'use strict'

/**
 * Default error handlers attached to all algorithmic orders if no explicit
 * handlers are supplied.
 *
 * @module DefaultErrorHandlers
 */
module.exports = {
  onErrorInsufficientBalance: require('./error_insufficient_balance'),
  onErrorMinimumSize: require('./error_minimum_size'),
  onOrdersOrderError: require('./orders_order_error')
}
