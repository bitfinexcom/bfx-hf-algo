'use strict'

const _isFinite = require('lodash/isFinite')
const { prepareAmount } = require('bfx-api-node-util')
const getMinMaxDistortedAmount = require('../../util/get_min_max_distorted_amount')

/**
 * Returns null or a confirmation object to show in the UI if the input sliced
 * order amounts cannot be totalled to the amount entered by the user.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @param {object} args - order form parameters
 * @param {object} pairConfig - min and max order size of the selected market pair
 * @returns {object || null} previewOrders
 */
module.exports = (args = {}, pairConfig = {}) => {
  const { minSize } = pairConfig
  const { amount, amountDistortion } = args
  const { maxDistortedAmount } = getMinMaxDistortedAmount(args, pairConfig)

  const isAmountDistorted = _isFinite(amountDistortion) && amountDistortion > 0

  const slicedOrderLength = Math.floor(amount / maxDistortedAmount)
  const maxPossibleAmount = maxDistortedAmount * slicedOrderLength

  const residualAmount = +prepareAmount(Math.abs(amount) - Math.abs(maxPossibleAmount))

  if (residualAmount === 0 || residualAmount >= minSize) {
    return null
  }

  return {
    confirmMessage: `Last slice amount ${isAmountDistorted ? 'including distortion' : ''} is smaller
    than minimum order size, should we discard it to continue ?`,
    confirmOptions: [
      { label: 'Yes', shouldContinue: true },
      { label: 'No', shouldContinue: false }
    ]
  }
}
