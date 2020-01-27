'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const { orders, limit } = args
  // TODO add proper table
  return ['Triangular Arbitrage'].concat(
    orders.map((o) => {
      return ` | ${o.symbol} ${o.amount} @ ${o.price || o.type}`
    })
  ).join('')
}
