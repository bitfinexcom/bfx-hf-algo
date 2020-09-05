'use strict'

/**
 * Generates a label for an OOCC instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, orderPrice, amount,
  } = args

  return [
    'OOCC',
    ` | ${orderType} `,
    ` | ${amount} @ ${orderPrice || orderType} `
  ].join('')
}

module.exports = genOrderLabel
