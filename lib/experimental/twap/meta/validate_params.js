'use strict'

const { Order } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')
const Config = require('../config')

// TODO: Expand
module.exports = (args = {}) => {
  const {
    orderType, amount, sliceAmount, sliceInterval, priceTarget,
    cancelDelay, submitDelay
  } = args

  const targetType = typeof priceTarget

  if (!Order.type[orderType]) err = 'invalid order type'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) err = 'invalid cancel delay'
  if (!_isFinite(submitDelay) || submitDelay < 0) err = 'invalid submit delay'
  if (!_isFinite(amount)) err = 'invalid amount'
  if (!_isFinite(sliceAmount)) err = 'invalid slice amount'
  if (!_isFinite(sliceInterval)) err = 'slice interval not a number'
  if (sliceInterval <= 0) err = 'slice interval <= 0'
  if (
    (targetType !== 'string' && targetType !== 'number') ||
    (targetType === 'string' && !Config.PRICE_TARGET[priceTarget]) ||
    (targetType === 'number' && priceTarget <= 0)
  ) {
    err = 'invalid price target'
  }

  return null
}
