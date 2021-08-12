'use strict'

const HFI = require('bfx-hf-indicators')
const scheduleTick = require('../util/schedule_tick')
const hasIndicatorCap = require('../util/has_indicator_cap')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const getMinMaxDistortedAmount = require('../../util/get_min_max_distorted_amount')

/**
 * If needed, creates necessary indicators for price offset & cap calculation
 * and saves them on the instance state.
 *
 * Schedules the first tick of `self:interval_tick`.
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:lifeStart
 * @see module:AccumulateDistribute.onSelfIntervalTick
 * @see module:AccumulateDistribute.hasIndicatorOffset
 * @see module:AccumulateDistribute.hasIndicatorCap
 *
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orderAmounts, remainingAmount, pairConfig } = state
  const { debug, updateState, sendPing, subscribeDataChannels } = h
  const { amount, relativeCap, relativeOffset } = args

  debug(
    'starting with order amounts (total %f) %j [rem %f]',
    amount, orderAmounts, remainingAmount
  )

  const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(args, pairConfig)

  const updateOpts = {
    minDistortedAmount,
    maxDistortedAmount
  }

  const hasOffsetIndicator = hasIndicatorOffset(args)
  const hasCapIndicator = hasIndicatorCap(args)

  if (hasOffsetIndicator || hasCapIndicator) {
    const { ts } = await sendPing(state)
    updateOpts.ts = ts
  }

  if (hasOffsetIndicator) {
    const IndicatorClass = HFI[relativeOffset.type.toUpperCase()]
    const offsetIndicator = new IndicatorClass(relativeOffset.args)

    debug(
      'initialized offset indicator %s %j',
      relativeOffset.type, relativeOffset.args
    )

    updateOpts.offsetIndicator = offsetIndicator
  }

  if (hasIndicatorCap(args)) {
    const IndicatorClass = HFI[relativeCap.type.toUpperCase()]
    const capIndicator = new IndicatorClass(relativeCap.args)

    debug('initialized cap indicator %s %j', relativeCap.type, relativeCap.args)

    updateOpts.capIndicator = capIndicator
  }

  await updateState(instance, updateOpts)

  subscribeDataChannels(state)
    .catch(e => debug('failed to subscribe to data channels: %s', e.message))

  scheduleTick.tick(instance)
}

module.exports = onLifeStart
