'use strict'

const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const Config = require('../config')

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol, priceCondition, priceTarget } = args
  const { declareChannel } = h
  let channel = null

  if (_isFinite(priceTarget) && _isString(priceCondition)) {
    if (
      (priceCondition === Config.PRICE_COND.MATCH_SIDE) ||
      (priceCondition === Config.PRICE_COND.MATCH_MIDPOINT)
    ) {
      channel = 'book'
    } else if (
      (priceCondition === Config.PRICE_COND.MATCH_LAST)
    ) {
      channel = 'trades'
    } else {
      throw new Error('invalid price condition %s', priceCondition)
    }
  } else if (_isString(priceTarget)) {
    if (
      (priceTarget === Config.PRICE_TARGET.OB_MID) ||
      (priceTarget === Config.PRICE_TARGET.OB_SIDE)
    ) {
      channel = 'book'
    } else if (priceTarget === Config.PRICE_TARGET.LAST) {
      channel = 'trades'
    } else {
      throw new Error('invalid price target %s', priceTarget)
    }
  }

  if (channel === 'trades') {
    await declareChannel(instance, host, 'trades', { symbol })
  } else {
    await declareChannel(instance, host, 'book', {
      symbol,
      prec: 'R0',
      len: '25'
    })
  }
}
