'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const Config = require('../config')

/**
 * Reports of the provided execution parameters have an order book price target.
 *
 * @memberOf module:TWAP
 * @param {object} args - execution parameters
 * @returns {boolean} hasOBTarget
 */
const hasOBTarget = (args = {}) => {
  const { priceTarget, priceCondition } = args

  if (_isFinite(priceTarget) && ( // explicit book match
    (priceCondition === Config.PRICE_COND.MATCH_SIDE) ||
    (priceCondition === Config.PRICE_COND.MATCH_MIDPOINT)
  )) {
    return true
  }

  if (_isString(priceTarget) && ( // soft book match
    (priceTarget === Config.PRICE_TARGET.OB_MID) ||
    (priceTarget === Config.PRICE_TARGET.OB_SIDE)
  )) {
    return true
  }

  return false
}

module.exports = hasOBTarget
