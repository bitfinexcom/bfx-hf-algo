'use strict'

/**
 * Generates a label for an OCOCO instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/OCOCO
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, orderPrice, amount, ocoAmount, limitPrice, stopPrice
  } = args

  return [
    'OCOCO',
    ` | ${amount} @ ${orderPrice || orderType} `,
    ` | triggers ${ocoAmount} @ ${limitPrice} (stop ${stopPrice})`
  ].join('')
}

module.exports = genOrderLabel
