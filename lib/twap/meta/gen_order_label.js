'use strict'

const { apply: applyI18N } = require('../../util/i18n')

/**
 * Generates a label for a TWAP instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const {
    sliceAmount, sliceInterval, amount, priceTarget, priceCondition,
    tradeBeyondEnd
  } = args
  const interval = Math.floor(sliceInterval / 1000)

  return applyI18N({
    origin: [
      'TWAP',
      ' | slice ', sliceAmount,
      ' | total ', amount,
      ' | interval ', interval, 's',
      ' | target ', priceTarget,
      ' | target == ', priceCondition,
      ' | TBE ', tradeBeyondEnd
    ].join('')
  },
  'twap.label',
  { sliceAmount, amount, interval, priceTarget, priceCondition, tradeBeyondEnd }
  )
}

module.exports = genOrderLabel
