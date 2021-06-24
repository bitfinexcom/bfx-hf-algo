'use strict'

const hasOBRequirement = require('./has_ob_requirement')
const hasIndicatorOffset = require('./has_indicator_offset')
const hasIndicatorCap = require('./has_indicator_cap')
const hasTradeRequirement = require('./has_trade_requirement')

const orderMapIndex = {
  cid: 0,
  type: 1,
  orderAmount: 2,
  orderPrice: 3,
  dateTime: 4,
  topAskOrderId: 5,
  topAskPrice: 6,
  topBidOrderId: 7,
  topBidPrice: 8,
  midPrice: 9,
  offsetIndicatorValue: 10,
  capIndicatorValue: 11,
  lastTradeId: 12,
  lastTradeMts: 13,
  lastTradeAmount: 14,
  lastTradePrice: 15
}

module.exports = (order, state) => {
  const { args = {}, lastBook, offsetIndicator, capIndicator, lastTrade } = state

  const data = new Array(16).fill(null)
  data[orderMapIndex.dateTime] = new Date()

  const { cid, type, amount: orderAmount, price: orderPrice } = order

  data[orderMapIndex.cid] = cid
  data[orderMapIndex.type] = type
  data[orderMapIndex.orderAmount] = orderAmount
  data[orderMapIndex.orderPrice] = orderPrice

  if (hasOBRequirement(args) && lastBook) {
    const [topAskOrderId = null] = lastBook.topAskLevel() || []
    const [topBidOrderId = null] = lastBook.topBidLevel() || []

    data[orderMapIndex.topAskOrderId] = topAskOrderId
    data[orderMapIndex.topBidOrderId] = topBidOrderId
    data[orderMapIndex.topAskPrice] = lastBook.topAsk()
    data[orderMapIndex.topBidPrice] = lastBook.topBid()
    data[orderMapIndex.midPrice] = lastBook.midPrice()
  }

  if (hasIndicatorOffset(args) && offsetIndicator) {
    data[orderMapIndex.offsetIndicatorValue] = offsetIndicator.v()
  }

  if (hasIndicatorCap(args) && capIndicator) {
    data[orderMapIndex.capIndicatorValue] = capIndicator.v()
  }

  if (hasTradeRequirement(args) && lastTrade) {
    const { id, mts, amount, price } = lastTrade

    data[orderMapIndex.lastTradeId] = id
    data[orderMapIndex.lastTradeMts] = new Date(mts)
    data[orderMapIndex.lastTradeAmount] = amount
    data[orderMapIndex.lastTradePrice] = price
  }

  return [data]
}
