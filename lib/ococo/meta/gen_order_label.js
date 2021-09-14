'use strict'

const { apply: applyI18N } = require('../../util/i18n')

/**
 * Generates a label for an OCOCO instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OCOCO
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, orderPrice, amount, ocoAmount, limitPrice, stopPrice
  } = args

  return applyI18N({
    origin: [
      'OCOCO',
      ` | ${amount} @ ${orderPrice || orderType} `,
      ` | triggers ${ocoAmount} @ ${limitPrice} (stop ${stopPrice})`
    ].join('')
  },
  'ococo.label',
  { amount, orderPrice, orderType, ocoAmount, limitPrice, stopPrice }
  )
}

module.exports = genOrderLabel
