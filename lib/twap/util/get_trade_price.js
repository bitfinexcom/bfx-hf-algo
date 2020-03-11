'use strict'

const _isFinite = require('lodash/isFinite')
const Config = require('../config')

/**
 * Extracts the target price from the last known trade. Null if unavailable
 *
 * @memberOf module:TWAP
 * @param {object} state - instance state
 * @returns {number} tradePrice
 */
const getTradePrice = (state = {}) => {
  const { args = {}, lastTrade } = state
  const { priceTarget, priceCondition } = args

  if (!lastTrade) {
    return null
  }

  const { price } = lastTrade

  if (_isFinite(priceTarget)) {
    if (priceCondition === Config.PRICE_COND.MATCH_LAST) {
      return price
    }
  } else if (priceTarget === Config.PRICE_TARGET.LAST) {
    return price
  }

  return null
}

module.exports = getTradePrice
