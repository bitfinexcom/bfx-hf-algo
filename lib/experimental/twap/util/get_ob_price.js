'use strict'

const _isFinite = require('lodash/isFinite')
const Config = require('../config')

/**
 * Extracts the target price from the last known order book. Null if unavailable
 *
 * @param {Object} state
 * @return {number} obPrice
 */
module.exports = (state = {}) => {
  const { args = {}, lastBook } = state
  const { amount, priceTarget, priceCondition } = args
  let price = null

  if (!lastBook) {
    return null
  }

  if (_isFinite(priceTarget)) {
    if (priceCondition === Config.PRICE_COND.MATCH_SIDE) {
      price = amount < 0
        ? lastBook.topBid()
        : lastBook.topAsk()
    } else if (priceCondition === Config.PRICE_COND.MATCH_MIDPOINT) {
      price = lastBook.midPrice()
    }
  } else if (priceTarget === Config.PRICE_TARGET.OB_SIDE) {
    price = amount < 0
      ? lastBook.topBid()
      : lastBook.topAsk()
  } else if (priceTarget === Config.PRICE_TARGET.OB_MID) {
    price = lastBook.midPrice()
  }

  return price
}
