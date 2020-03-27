'use strict'

const genOrders = require('../util/generate_orders')

/**
 * Generates an array of preview orders which show what could be expected if
 * an instance of Iceberg was executed with the specified parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} args - instance parameters
 * @returns {object[]} previewOrders
 */
const genPreview = (args = {}) => {
  const { amount } = args

  return genOrders({
    remainingAmount: amount,
    args
  })
}

module.exports = genPreview
