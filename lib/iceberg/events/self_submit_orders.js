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
 * @returns {Promise} p - resolves on completion
 * @see module:Iceberg~generateOrders
 */
const onSelfSubmitOrders = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { emit, timeout } = h
  const { args = {}, gid } = state
  const { submitDelay } = args

  if (submitDelay) {
    const [, t] = timeout(submitDelay)
    await t()
  }

  const orders = generateOrders(instance.state)

  return emit('exec:order:submit:all', gid, orders, 0)
}

module.exports = onSelfSubmitOrders
