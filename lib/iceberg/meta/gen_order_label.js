'use strict'

const { nBN } = require('@bitfinex/lib-js-util-math')

/**
 * Generates a label for an Iceberg instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const { amount, price, sliceAmount, excessAsHidden } = args
  const mul = amount < 0 ? -1 : 1

  return [
    'Iceberg',
    ` | ${amount} @ ${price} `,
    ` | slice ${mul * sliceAmount}`,

    excessAsHidden
      ? ` | excess ${mul * nBN(amount).abs().minus(Math.abs(sliceAmount))}`
      : ''
  ].join('')
}

module.exports = genOrderLabel
