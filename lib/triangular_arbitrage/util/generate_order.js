'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { MARKET, BEST_BID, BEST_ASK, ORDER_TYPES_TO_BFX, ORDER_TYPES_TO_MARGIN_BFX } = require('./constants')
const { getOrderFinalCurrency, getBase, getQuote } = require('./symbols')

module.exports = (instance = {}, symbol) => {
  const { state = {}, h = {} } = instance
  const { debug } = h
  const { args = {}, lastBook, gid, orders = {} } = state
  const {
    symbol1, orderType1, symbol2, orderType2, symbol3, orderType3,
    amount, _margin, hidden, lev, _futures
  } = args

  const sharedOrderParams = {
    symbol,
    hidden,
    gid
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  let orderType
  let lastOrder
  switch (symbol) {
    case symbol1:
      orderType = orderType1
      lastOrder = null
      if (Object.values(orders).length !== 0) {
        debug(`Attempted to submit initial order it already exists`)
        return
      }
      break
    case symbol2:
      orderType = orderType2
      if (Object.values(orders).length !== 1) {
        debug(`Attempted to submit initial order it already exists`)
        return
      }
      lastOrder = Object.values(orders)[0]
      break
    case symbol3:
      orderType = orderType3
      if (Object.values(orders).length !== 2) {
        debug(`Attempted to submit final order it already exists`)
        return
      }
      lastOrder = Object.values(orders)[1]
      break
    default:
      // not the correct market
      return
  }

  let price
  if (orderType === MARKET) {
    // execute as market order
    price = 0
  } else if (orderType === BEST_BID || orderType === BEST_ASK) {
    // get price from last book
    const book = lastBook[symbol]
    if (!book) {
      debug(`No orderbook data for market ${symbol} yet`)
      return
    }
    if (orderType === BEST_BID) {
      // get best ask price
      price = book.topBid()
    } else if (orderType === BEST_ASK) {
      // get best bid price
      price = book.topAsk()
    }
  } else {
    debug(`Unrecognized order type ${orderType}`)
  }

  // get the ending currency of the last order
  let ccy
  let orderAmount = amount
  // if no orders have been made then use the starting amount
  if (!lastOrder) {
    if (amount > 0) {
      ccy = getBase(symbol)
    } else {
      ccy = getQuote(symbol)
    }
  } else {
    ccy = getOrderFinalCurrency(lastOrder)
    // calculate base on the last order how much to
    // execute in the next order
    const base = getBase(symbol)
    const quote = getQuote(symbol)
    if (base === ccy) {
      orderAmount = -lastOrder.amountOrig
    } else if (quote === ccy) {
      orderAmount = lastOrder.amountOrig / price
    } else {
      debug(`Path from ${ccy} does not match original args`)
      return
    }
  }

  debug(`resolved order ${symbol} price %f`, price)
  debug(`resolved order ${symbol} amount %f`, orderAmount)

  return new Order({
    ...sharedOrderParams,
    amount: orderAmount,
    symbol,
    // get amount from previous order
    price: price,
    cid: genCID(),
    type: _margin || _futures ? ORDER_TYPES_TO_MARGIN_BFX[orderType] : ORDER_TYPES_TO_BFX[orderType]
  })
}
