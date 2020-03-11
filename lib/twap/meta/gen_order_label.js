'use strict'

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

  return [
    'TWAP',
    ' | slice ', sliceAmount,
    ' | total ', amount,
    ' | interval ', Math.floor(sliceInterval / 1000), 's',
    ' | target ', priceTarget,
    ' | target == ', priceCondition,
    ' | TBE ', tradeBeyondEnd
  ].join('')
}

module.exports = genOrderLabel
