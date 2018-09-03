'use strict'

const _isFinite = require('lodash/isFinite')
const HFI = require('bfx-hf-indicators')
const { prepareAmount } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const scheduleTick = require('../util/schedule_tick')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { debug, emitSelf, updateState } = h
  const {
    amount, sliceAmount, amountDistortion, relativeCap, relativeOffset
  } = args

  let orderAmounts = []

  if (_isFinite(amountDistortion)) {
    let totalAmount = 0

    while (Math.abs(amount - totalAmount) > DUST) {
      const m = Math.random() > 0.5 ? 1 : -1
      const orderAmount = sliceAmount * (1 + (Math.random() * amountDistortion * m))
      const remAmount = amount - totalAmount
      const cappedOrderAmount = +prepareAmount(Math.min(remAmount, orderAmount))

      orderAmounts.push(cappedOrderAmount)
      totalAmount += cappedOrderAmount
    }
  } else {
    const n = Math.ceil(amount / sliceAmount)
    orderAmounts = Array.apply(null, Array(n)).map(() => sliceAmount)
  }

  // TODO: Remove sanity check
  let totalAmount = 0
  orderAmounts.forEach(a => totalAmount += a)

  if (Math.abs(totalAmount - amount) > DUST) {
    throw new Error(`total order amount is too large: ${totalAmount} > ${amount}`)
  }

  debug('initialized order amounts (total %f) %j', totalAmount, orderAmounts)

  await updateState(instance, {
    orderAmounts,
    currentOrder: 0,
    ordersBehind: 0,
    remainingAmount: amount
  })

  if (hasIndicatorOffset(args)) {
    const IndicatorClass = HFI[relativeOffset.type.toUpperCase()]
    const offsetIndicator = new IndicatorClass(relativeOffset.args)

    debug('initialized offset indicator %s %j', relativeOffset.type, relativeOffset.args)

    await updateState(instance, { offsetIndicator })
  }

  if (hasIndicatorCap(args)) {
    const IndicatorClass = HFI[relativeCap.type.toUpperCase()]
    const capIndicator = new IndicatorClass(relativeCap.args)

    debug('initialized cap indicator %s %j', relativeCap.type, relativeCap.args)

    await updateState(instance, { capIndicator })
  }

  await emitSelf('submit_order') // submit initial slice order
  await scheduleTick(instance)
}
