'use strict'

const { nBN } = require('@bitfinex/lib-js-util-math')
const { apply: applyI18N } = require('../../util/i18n')

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
  const excess = mul * nBN(amount).abs().minus(Math.abs(sliceAmount))

  return applyI18N({
    origin: [
      'Iceberg',
      ` | ${amount} @ ${price} `,
      ` | slice ${mul * sliceAmount}`,

      excessAsHidden
        ? ` | excess ${excess}`
        : ''
    ].join('')
  },
  `iceberg${excessAsHidden ? 'Hidden' : ''}.label`,
  { amount, price, slice: mul * sliceAmount, excess }
  )
}

module.exports = genOrderLabel
