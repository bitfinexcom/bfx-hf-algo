'use strict'

/**
 * Generates a label for an AccumulateDistribute instance for rendering in an
 * UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const { orderType, amount, limitPrice, sliceAmount, sliceInterval } = args

  const labelParts = [
    'A/D',
    ` | ${amount} @ ${limitPrice || orderType} `,
    ` | slice ${sliceAmount}`,
    ' | interval ', Math.floor(sliceInterval / 1000), 's'
  ]

  if (orderType === 'LIMIT') {
    labelParts.push(` | LIMIT ${args.limitPrice}`)
  } else if (orderType === 'MARKET') {
    labelParts.push(' | MARKET')
  } else {
    labelParts.push(` | Offset ${args.relativeOffset.type.toUpperCase()}`)
    labelParts.push(` | Cap ${args.relativeCap.type.toUpperCase()}`)
  }

  return labelParts.join('')
}

module.exports = genOrderLabel
