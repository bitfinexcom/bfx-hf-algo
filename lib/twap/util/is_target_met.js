'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * Reports if the price target for the provided execution parameters is met
 * for the specified price.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @name module:bfx-hf-algo/TWAP.isTargetMet
 * @param {object} args - execution parameters
 * @param {number} price - price target value
 * @returns {boolean} targetMet
 */
const isTargetMet = (args = {}, price) => {
  const { priceTarget, priceDelta } = args

  return _isFinite(priceDelta)
    ? price >= (priceTarget - priceDelta) && price <= (priceTarget + priceDelta)
    : price === priceTarget
}

module.exports = isTargetMet
