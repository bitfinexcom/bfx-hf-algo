'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const _isUndefined = require('lodash/isUndefined')
const Config = require('../config')

module.exports = (args = {}) => {
  const {
    orderType, amount, sliceAmount, sliceInterval, priceTarget, priceCondition,
    cancelDelay, submitDelay, priceDelta, lev, _futures
  } = args

  let err = null

  if (!Order.type[orderType]) err = 'invalid order type'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) err = 'invalid cancel delay'
  if (!_isFinite(submitDelay) || submitDelay < 0) err = 'invalid submit delay'
  if (!_isFinite(amount)) err = 'invalid amount'
  if (!_isFinite(sliceAmount)) err = 'invalid slice amount'
  if (!_isFinite(sliceInterval)) err = 'slice interval not a number'
  if (sliceInterval <= 0) err = 'slice interval <= 0'
  if (!_isString(priceTarget) && !_isFinite(priceTarget)) {
    err = 'invalid price target'
  } else if (_isFinite(priceTarget) && priceTarget <= 0) {
    err = 'negative custom price target'
  } else if (_isFinite(priceTarget) && !Config.PRICE_COND[priceCondition]) {
    err = 'invalid condition for custom price target'
  } else if (_isString(priceTarget) && !Config.PRICE_TARGET[priceTarget]) {
    err = 'invalid matched price target'
  } else if (!_isUndefined(priceDelta) && !_isFinite(priceDelta)) {
    err = 'invalid price delta provided'
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return 'Amount & slice amount must have same sign'
  }

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100'
  }

  return err
}
