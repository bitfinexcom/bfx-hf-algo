'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const {
    amount, pingPrice, pongPrice, orderCount, pingMinPrice, pingMaxPrice,
    pongDistance
  } = args

  if (orderCount === 1) {
    return `Ping/Pong | ${amount} @ ${pingPrice} -> ${pongPrice} `
  } else {
    const sign = amount < 0 ? '-' : '+'
    const spread = `[${pingMinPrice}..${pingMaxPrice}]`
    return `Ping/Pong | ${amount} @ ${spread} -> ${sign}${pongDistance} `
  }
}
