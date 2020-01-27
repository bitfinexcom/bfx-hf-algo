'use strict'

const LIMIT_TYPES = ['BEST_ASK', 'BEST_BID']

module.exports = async (instance = {}, host) => {
  const { h = {}, state = {} } = instance
  const { args = {} } = state
  const { symbol1, symbol2, symbol3, orderType1, orderType2, orderType3 } = args
  const { declareChannel } = h
  const len = 5
  const prec = 'R0'

  if (LIMIT_TYPES.includes(orderType1)) {
    await declareChannel(instance, host, 'book', {
      symbol: symbol1,
      prec,
      len
    })
  }
  if (LIMIT_TYPES.includes(orderType2)) {
    await declareChannel(instance, host, 'book', {
      symbol: symbol2,
      prec,
      len
    })
  }
  if (LIMIT_TYPES.includes(orderType3)) {
    await declareChannel(instance, host, 'book', {
      symbol: symbol3,
      prec,
      len
    })
  }
}
