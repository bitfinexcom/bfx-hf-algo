'use strict'

const HFI = require('bfx-hf-indicators')
const scheduleTick = require('../util/schedule_tick')
const hasIndicatorOffset = require('../util/has_indicator_offset')
const hasIndicatorCap = require('../util/has_indicator_cap')

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
  const { args = {}, orderAmounts, remainingAmount } = state
  const { debug, updateState, subscribeDataChannels } = h
  const { amount, relativeCap, relativeOffset } = args

  debug(
    'starting with order amounts (total %f) %j [rem %f]',
    amount, orderAmounts, remainingAmount
  )

  if (hasIndicatorOffset(args)) {
    const IndicatorClass = HFI[`${relativeOffset.type === 'ma' ? 'sma' : relativeOffset.type}`.toUpperCase()]
    const offsetIndicator = new IndicatorClass(relativeOffset.args)

    debug(
      'initialized offset indicator %s %j',
      relativeOffset.type, relativeOffset.args
    )

    await updateState(instance, { offsetIndicator })
  }

  if (hasIndicatorCap(args)) {
    const IndicatorClass = HFI[`${relativeCap.type === 'ma' ? 'sma' : relativeCap.type}`.toUpperCase()]
    const capIndicator = new IndicatorClass(relativeCap.args)

    debug('initialized cap indicator %s %j', relativeCap.type, relativeCap.args)

    await updateState(instance, { capIndicator })
  }

  subscribeDataChannels(state)

  await scheduleTick.tick(instance)
}

module.exports = onLifeStart
