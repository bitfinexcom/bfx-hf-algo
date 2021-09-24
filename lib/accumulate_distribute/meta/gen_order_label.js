'use strict'

const { apply: applyI18N } = require('../../util/i18n')

/**
 * Generates a label for an AccumulateDistribute instance for rendering in an
 * UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, amount, limitPrice, sliceAmount, sliceInterval,
    relativeOffset, relativeCap
  } = args
  const interval = Math.floor(sliceInterval / 1000)

  const labelParts = [
    'A/D',
    ` | ${amount} @ ${limitPrice || orderType} `,
    ` | slice ${sliceAmount}`,
    ' | interval ', interval, 's'
  ]

  if (orderType === 'LIMIT') {
    labelParts.push(` | LIMIT ${limitPrice}`)
  } else if (orderType === 'MARKET') {
    labelParts.push(' | MARKET')
  } else {
    labelParts.push(` | Offset ${relativeOffset.type.toUpperCase()}`)
    labelParts.push(` | Cap ${relativeCap.type.toUpperCase()}`)
  }

  return applyI18N({
    origin: labelParts.join('')
  },
  `accDist${orderType === 'LIMIT' ? 'Limit' : (orderType === 'MARKET' ? 'Market' : '')}.label`,
  { amount, limitPrice, orderType, sliceAmount, interval, relativeOffset, relativeCap }
  )
}

module.exports = genOrderLabel
