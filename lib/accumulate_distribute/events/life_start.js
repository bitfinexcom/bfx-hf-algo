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
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens module:bfx-hf-algo.AOHost~event:lifeStart
 * @see module:bfx-hf-algo/AccumulateDistribute.onSelfIntervalTick
 * @see module:bfx-hf-algo/AccumulateDistribute.hasIndicatorOffset
 * @see module:bfx-hf-algo/AccumulateDistribute.hasIndicatorCap
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orderAmounts, remainingAmount } = state
  const { debug, updateState } = h
  const { amount, relativeCap, relativeOffset } = args

  debug(
    'starting with order amounts (total %f) %j [rem %f]',
    amount, orderAmounts, remainingAmount
  )

  if (hasIndicatorOffset(args)) {
    const IndicatorClass = HFI[relativeOffset.type.toUpperCase()]
    const offsetIndicator = new IndicatorClass(relativeOffset.args)

    debug(
      'initialized offset indicator %s %j',
      relativeOffset.type, relativeOffset.args
    )

    await updateState(instance, { offsetIndicator })
  }

  if (hasIndicatorCap(args)) {
    const IndicatorClass = HFI[relativeCap.type.toUpperCase()]
    const capIndicator = new IndicatorClass(relativeCap.args)

    debug('initialized cap indicator %s %j', relativeCap.type, relativeCap.args)

    await updateState(instance, { capIndicator })
  }

  await scheduleTick.tick(instance)
}

module.exports = onLifeStart
