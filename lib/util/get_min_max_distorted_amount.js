'use strict'

const _isFinite = require('lodash/isFinite')
const { prepareAmount } = require('bfx-api-node-util')

module.exports = (args = {}, pairConfig = {}) => {
  const { amount, sliceAmount, amountDistortion = 0 } = args
  const { minSize, maxSize } = pairConfig

  const m = amount < 0 ? -1 : 1

  let maxDistortedAmount = (1 + amountDistortion) * sliceAmount
  let minDistortedAmount = (1 - amountDistortion) * sliceAmount

  if (_isFinite(minSize)) {
    if (Math.abs(minDistortedAmount) < minSize) minDistortedAmount = m * minSize
    if (Math.abs(maxDistortedAmount) < minSize) maxDistortedAmount = m * minSize
  }

  if (_isFinite(maxSize)) {
    if (Math.abs(minDistortedAmount) > maxSize) minDistortedAmount = m * maxSize
    if (Math.abs(maxDistortedAmount) > maxSize) maxDistortedAmount = m * maxSize
  }

  return {
    minDistortedAmount: +prepareAmount(minDistortedAmount),
    maxDistortedAmount: +prepareAmount(maxDistortedAmount)
  }
}
