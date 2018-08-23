'use strict'

const _pick = require('lodash/pick')

module.exports = (state = {}) => {
  const { args, remainingAmount } = state
  const data = _pick(args, [
    'orderType', 'amount', 'sliceAmount', 'price', 'submitDelay',
    'cancelDelay', 'excessAsHidden'
  ])

  data.remainingAmount = remainingAmount

  return data
}
