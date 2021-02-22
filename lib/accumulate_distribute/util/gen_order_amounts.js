'use strict'

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
  const orderAmounts = []
  let totalAmount = 0

  while (nBN(amount).abs().minus(Math.abs(totalAmount)).toNumber() > DUST) {
    const m = Math.random() > 0.5 ? 1 : -1
    const orderAmount = Math.min(sliceAmount, sliceAmount * (1 + (Math.random() * amountDistortion * m)))
    const remAmount = nBN(amount).minus(totalAmount).toNumber()
    const cappedOrderAmount = +prepareAmount(remAmount < 0
      ? Math.max(remAmount, orderAmount)
      : Math.min(remAmount, orderAmount)
    )

    orderAmounts.push(cappedOrderAmount)
    totalAmount = nBN(totalAmount).plus(cappedOrderAmount).toNumber()
  }

  return orderAmounts
}

module.exports = {
  gen: generateOrderAmounts // wrapped in object so we can be mocked
}
