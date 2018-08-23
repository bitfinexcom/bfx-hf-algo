'use strict'

const _isFinite = require('lodash/isFinite')
const _pick = require('lodash/pick')

module.exports = (data = {}) => {
  const { remainingAmount } = data
  const args = _pick(data, [
    'orderType', 'amount', 'sliceAmount', 'price', 'submitDelay',
    'cancelDelay', 'excessAsHidden'
  ])

  if (!_isFinite(remainingAmount) || remainingAmount <= 0) {
    throw new Error(`invalid remaining amount: ${remainingAmount}`)
  }

  return {
    args,
    state: { remainingAmount }
  }
}
