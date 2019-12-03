'use strict'

const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

module.exports = (instance = {}) => {
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
      type: _margin || _futures ? 'MARKET' : 'EXCHANGE MARKET'
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      ...sharedOrderParams,
      price: limitPrice,
      cid: genCID(),
      type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT'
    })
  } else if (orderType !== 'RELATIVE') {
    throw new Error(`unknown order type: ${orderType}`)
  }

  let offsetPrice

  switch (relativeOffset.type) {
    case 'trade': {
      offsetPrice = lastTrade.price
      break
    }

    case 'bid': {
      offsetPrice = lastBook.topBid()
      break
    }

    case 'ask': {
      offsetPrice = lastBook.topAsk()
      break
    }

    case 'mid': {
      offsetPrice = lastBook.midPrice()
      break
    }

    case 'ema': {
      offsetPrice = offsetIndicator.v() // guaranteed seeded
      break
    }

    case 'ma': {
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

  let finalPrice = offsetPrice + relativeOffset.delta

  if (_isObject(relativeCap) && relativeCap.type !== 'none') {
    let priceCap

    switch (relativeCap.type) {
      case 'trade': {
        priceCap = lastTrade.price
        break
      }

      case 'bid': {
        priceCap = lastBook.topBid()
        break
      }

      case 'ask': {
        priceCap = lastBook.topAsk()
        break
      }

      case 'mid': {
        priceCap = lastBook.midPrice()
        break
      }

      case 'ema': {
        priceCap = capIndicator.v() // guaranteed seeded
        break
      }

      case 'ma': {
        priceCap = capIndicator.v() // guaranteed seeded
        break
      }

      default: {
        throw new Error(`unknown relative cap type: ${relativeCap.type}`)
      }
    }

    if (!_isFinite(priceCap)) {
      return null // awaiting data
    }

    priceCap += relativeCap.delta

    debug('resolved cap price %f', priceCap)

    finalPrice = Math.min(finalPrice, priceCap)
  }

  return new Order({
    ...sharedOrderParams,
    price: finalPrice,
    cid: genCID(),
    type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT'
  })
}
