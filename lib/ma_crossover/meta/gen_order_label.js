'use strict'

const { apply: applyI18N } = require('../../util/i18n')

/**
 * Generates a label for an MACrossver instance for rendering in an UI.
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
  const { orderType, orderPrice, amount, long, short } = args
  const priceShouldBeDisplayed = orderType === 'LIMIT'

  return applyI18N({
    origin: [
      'MA Crossover',
      ` | ${amount} @ ${priceShouldBeDisplayed ? orderPrice : orderType} `,
      ` | long ${long.type.toUpperCase()}(${long.args[0]})`,
      ` | short ${short.type.toUpperCase()}(${short.args[0]})`
    ].join('')
  },
  `maCrossover${priceShouldBeDisplayed ? 'Limit' : ''}.label`,
  { amount, orderPrice, orderType, long, short }
  )
}

module.exports = genOrderLabel
