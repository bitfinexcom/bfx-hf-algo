'use strict'

/**
 * @private
 *
 * @param {object} orders - order map
 * @returns {boolean} hasOpenOrders
 */
const hasOpenOrders = (orders = {}) => {
  return !!Object.values(orders).find((order = {}) => {
    const { status } = order

    return !status || (
      !status.match(/CANCELED/) && !status.match(/EXECUTED/)
    )
  })
}

module.exports = hasOpenOrders
