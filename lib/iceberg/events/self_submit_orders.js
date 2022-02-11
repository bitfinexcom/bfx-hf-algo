'use strict'

const generateOrders = require('../util/generate_orders')

/**
 * Submits the next slice order, and remaining amount as a hidden order if
 * configured.
 *
 * @memberOf module:Iceberg
 * @listens module:Iceberg~selfSubmitOrders
 *
 * @param {AOInstance} instance - AO instance
 * @param {Signal} origin - the signal that triggered order creation
 * @returns {Promise} p - resolves on completion
 * @see module:Iceberg~generateOrders
 */
const onSelfSubmitOrders = async (instance = {}, origin) => {
  const {
    state: { gid },
    h: { emit }
  } = instance

  const orders = generateOrders(instance, origin)

  return emit('exec:order:submit:all', gid, orders)
}

module.exports = onSelfSubmitOrders
