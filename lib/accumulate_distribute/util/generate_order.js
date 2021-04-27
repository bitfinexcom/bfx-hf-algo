'use strict'

const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const { nBN } = require('@bitfinex/lib-js-util-math')
const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates an atomic order to fill one slice of an AccumulateDistribute
 * instance.
 *
 * @memberOf module:AccumulateDistribute
 * @name module:AccumulateDistribute~generateOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Order} o - null if awaiting data
 */
const generateOrder = (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { debug } = h
  const {
    args = {}, orderAmounts, currentOrder, lastBook, lastTrade,
    capIndicator, offsetIndicator, remainingAmount
  } = state

  const {
    symbol, orderType, relativeOffset, relativeCap, limitPrice, _margin, hidden,
    lev, _futures
  } = args

  const scheduledAmount = orderAmounts[Math.min(currentOrder, orderAmounts.length - 1)]
  const amount = scheduledAmount > 0
    ? Math.min(scheduledAmount, remainingAmount)
    : Math.max(scheduledAmount, remainingAmount)

  const sharedOrderParams = {
    symbol,
    amount,
    hidden
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  if (orderType === 'MARKET') {
    return new Order({
      ...sharedOrderParams,
      cid: genCID(),
      type: _margin || _futures ? 'MARKET' : 'EXCHANGE MARKET',
      meta: { _HF: 1 }
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      ...sharedOrderParams,
      price: limitPrice,
      cid: genCID(),
      type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
      meta: { _HF: 1 }
    })
  } else if (orderType !== 'RELATIVE') {
    throw new Error(`unknown order type: ${orderType}`)
  }

  let offsetPrice

  switch (relativeOffset.type) {
    case 'trade': {
      if (!lastTrade) return null
      offsetPrice = lastTrade.price
      break
    }

    case 'bid': {
      if (!lastBook) return null
      offsetPrice = lastBook.topBid()
      break
    }

    case 'ask': {
      if (!lastBook) return null
      offsetPrice = lastBook.topAsk()
      break
    }

    case 'mid': {
      if (!lastBook) return null
      offsetPrice = lastBook.midPrice()
      break
    }

    case 'ema': {
      if (offsetIndicator.l() === 0) return null
      offsetPrice = offsetIndicator.v() // guaranteed seeded
      break
    }

    case 'ma': {
      if (offsetIndicator.l() === 0) return null
      offsetPrice = offsetIndicator.v() // guaranteed seeded
      break
    }

    default: {
      throw new Error(`unknown relative offset type: ${relativeOffset.type}`)
    }
  }

  if (!_isFinite(offsetPrice)) {
    return null // awaiting data
  }

  debug('resolved offset price %f', offsetPrice)

  let finalPrice = nBN(offsetPrice).plus(relativeOffset.delta).toNumber()

  if (_isObject(relativeCap) && relativeCap.type !== 'none') {
    let priceCap

    switch (relativeCap.type) {
      case 'trade': {
        if (!lastTrade) return null
        priceCap = lastTrade.price
        break
      }

      case 'bid': {
        if (!lastBook) return null
        priceCap = lastBook.topBid()
        break
      }

      case 'ask': {
        if (!lastBook) return null
        priceCap = lastBook.topAsk()
        break
      }

      case 'mid': {
        if (!lastBook) return null
        priceCap = lastBook.midPrice()
        break
      }

      case 'ema': {
        if (capIndicator.l() === 0) return null
        priceCap = capIndicator.v()
        break
      }

      case 'ma': {
        if (capIndicator.l() === 0) return null
        priceCap = capIndicator.v()
        break
      }

      default: {
        throw new Error(`unknown relative cap type: ${relativeCap.type}`)
      }
    }

    if (!_isFinite(priceCap)) {
      return null
    }

    priceCap = nBN(priceCap).plus(relativeCap.delta).toNumber()

    debug('resolved cap price %f', priceCap)

    finalPrice = Math.min(finalPrice, priceCap)
  }

  return new Order({
    ...sharedOrderParams,
    price: finalPrice,
    cid: genCID(),
    type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
    meta: { _HF: 1 }
  })
}

module.exports = {
  gen: generateOrder
} // exported in object so we can be mocked
