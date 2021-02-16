'use strict'

const _isFinite = require('lodash/isFinite')
const { nBN } = require('@bitfinex/lib-js-util-math')

/**
 * Reports if the price target for the provided execution parameters is met
 * for the specified price.
 *
 * @memberOf module:TWAP
 * @name module:TWAP.isTargetMet
 * @param {object} args - execution parameters
 * @param {number} price - price target value
 * @returns {boolean} targetMet
 */
const isTargetMet = (args = {}, price) => {
  const { priceTarget, priceDelta } = args

  const priceSum = nBN(priceTarget).plus(priceDelta).toNumber()
  const priceDiff = nBN(priceTarget).minus(priceDelta).toNumber()

  return _isFinite(priceDelta)
    ? price >= priceDiff && price <= priceSum
    : price === priceTarget
}

module.exports = isTargetMet
