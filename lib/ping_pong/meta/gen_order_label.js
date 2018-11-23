'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const {
    pingAmount, pongAmount, pingPrice, pongPrice, orderCount, pingMinPrice,
    pingMaxPrice, pongDistance
  } = args

  if (orderCount === 1) {
    return `Ping/Pong | ${pingAmount}:${pongAmount} @ ${pingPrice} -> ${pongPrice} `
  } else {
    const sign = pongAmount < 0 ? '-' : '+'
    const spread = `[${pingMinPrice}..${pingMaxPrice}]`
    return `Ping/Pong | ${pingAmount}:${pongAmount} @ ${spread} -> ${sign}${pongDistance} `
  }
}
