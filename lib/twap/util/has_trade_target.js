'use strict'

const _isString = require('lodash/isString')
const _isFinite = require('lodash/isFinite')
const Config = require('../config')

module.exports = (args = {}) => {
  const { priceTarget, priceCondition } = args

  if (_isFinite(priceTarget) && ( // explicit trade match
    (priceCondition === Config.PRICE_COND.MATCH_LAST)
  )) {
    return true
  }

  if (_isString(priceTarget) && ( // soft trade match
    (priceTarget === Config.PRICE_TARGET.LAST)
  )) {
    return true
  }

  return false
}
