'use strict'

const _isFinite = require('lodash/isFinite')
const { Config } = require('bfx-api-node-core')
const { prepareAmount } = require('bfx-api-node-util')
const getMinMaxDistortedAmount = require('../../util/get_min_max_distorted_amount')
const getRandomNumberInRange = require('../../util/get_random_number_in_range')

const { DUST } = Config

const addRemainingToExistingOrderAmounts = (orderAmounts, opts) => {
  let { cappedOrderAmount: amountToBeDistributed } = opts
  const { amount, maxDistortedAmount } = opts

  const maxPossibleAmount = maxDistortedAmount * orderAmounts.length
  if (Math.abs(maxPossibleAmount) < Math.abs(amount)) {
    return
  }

  let i = 0
  while (Math.abs(amountToBeDistributed) > DUST) {
    if (orderAmounts[i] !== maxDistortedAmount) {
      const newOrderAmount = getRandomNumberInRange(orderAmounts[i], maxDistortedAmount)
      const distributedAmount = newOrderAmount - orderAmounts[i]

      if (Math.abs(amountToBeDistributed) - Math.abs(distributedAmount) <= DUST) {
        orderAmounts[i] = +prepareAmount(orderAmounts[i] + amountToBeDistributed)
        break
      }
      orderAmounts[i] = newOrderAmount
      amountToBeDistributed -= distributedAmount
    }
    i = (i === orderAmounts.length - 1) ? 0 : i + 1
  }
}

/**
 * Generates an array of order slices which add up to the total configured
 * amount. Randomizes them if `amountDistortion` is finite and non-zero.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @param {object} args - order parameters
 * @param {number} args.amount - total order amount
 * @param {number} args.sliceAmount - individual slice amount
 * @param {number} args.amountDistortion - desired distortion in %
 * @param {object} pairConfig - configs of the selected market pair
 * @param {number} pairConfig.minSize - minimum order size of the selected market pair
 * @param {number} pairConfig.maxSize - maximum order size of the selected market pair
 * @returns {number[]} orderAmounts
 */
const generateOrderAmounts = (args = {}, pairConfig = {}) => {
  const { amount } = args
  const { minSize } = pairConfig

  const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(args, pairConfig)

  let totalAmount = 0
  const orderAmounts = []

  while (Math.abs(amount) - Math.abs(totalAmount) > DUST) {
    const orderAmount = getRandomNumberInRange(minDistortedAmount, maxDistortedAmount)
    const remAmount = amount - totalAmount
    const cappedOrderAmount = +prepareAmount(remAmount < 0
      ? Math.max(remAmount, orderAmount)
      : Math.min(remAmount, orderAmount)
    )

    if (_isFinite(minSize) && Math.abs(cappedOrderAmount) < minSize) {
      addRemainingToExistingOrderAmounts(orderAmounts, { amount, cappedOrderAmount, maxDistortedAmount })
      break
    }

    orderAmounts.push(cappedOrderAmount)
    totalAmount += cappedOrderAmount
  }

  return orderAmounts
}

module.exports = {
  gen: generateOrderAmounts // wrapped in object so we can be mocked
}
