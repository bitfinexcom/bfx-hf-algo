'use strict'

/**
 * Generates a label for a PingPong instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
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

module.exports = genOrderLabel
