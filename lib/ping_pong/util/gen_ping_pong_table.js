'use strict'

module.exports = (args = {}) => {
  const {
    amount, pingPrice, pongPrice, pingMinPrice, pingMaxPrice, orderCount,
    pongDistance,
  } = args

  const pingPongTable = {}

  if (orderCount === 1) {
    pingPongTable[pingPrice] = pongPrice
  } else {
    const step = (pingMaxPrice - pingMinPrice) / (orderCount - 1)

    for (let i = 0; i < orderCount; i += 1) {
      const price = pingMinPrice + (i * step)
      pingPongTable[price] = amount > 0
        ? price + pongDistance
        : price - pongDistance
    }
  }

  return pingPongTable
}
