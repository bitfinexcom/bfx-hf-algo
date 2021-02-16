'use strict'

const _isFinite = require('lodash/isFinite')
const { nBN } = require('@bitfinex/lib-js-util-math')
const { prepareAmount } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

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
 * @returns {number[]} orderAmounts
 */
const generateOrderAmounts = (args = {}) => {
  const { amount, sliceAmount, amountDistortion } = args
  let orderAmounts = []

  if (_isFinite(amountDistortion)) {
    let totalAmount = 0

    while (nBN(amount).minus(totalAmount).abs().toNumber() > DUST) {
      const m = Math.random() > 0.5 ? 1 : -1
      const randomDistortedPercentage = nBN(Math.random()).multipliedBy(amountDistortion).toNumber() * m + 1
      const orderAmount = Math.min(sliceAmount, nBN(sliceAmount).multipliedBy(randomDistortedPercentage).toNumber())
      const remAmount = nBN(amount).minus(totalAmount).toNumber()
      const cappedOrderAmount = +prepareAmount(remAmount < 0
        ? Math.max(remAmount, orderAmount)
        : Math.min(remAmount, orderAmount)
      )

      orderAmounts.push(cappedOrderAmount)
      totalAmount = nBN(totalAmount).plus(cappedOrderAmount).toNumber()
    }
  } else {
    const n = Math.ceil(amount / sliceAmount)
    orderAmounts = Array.apply(null, Array(n)).map(() => sliceAmount)
  }

  return orderAmounts
}

module.exports = {
  gen: generateOrderAmounts // wrapped in object so we can be mocked
}
