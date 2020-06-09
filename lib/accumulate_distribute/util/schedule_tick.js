'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * Sets a timeout to emit the `self:interval_tick` event after the configured
 * slice interval passes, taking into account the configured interval
 * distortion for the AccumulateDistribute instance.
 *
 * If `catchUp` was enabled and the instance is behind with order fills, the
 * next tick is always scheduled in 200ms.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @see module:bfx-hf-algo/AccumulateDistribute~onSelfIntervalTick
 * @fires module:bfx-hf-algo/AccumulateDistribute.selfIntervalTick
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const scheduleTick = async (instance) => {
  const { state = {}, h = {} } = instance
  const { emitSelf, updateState, notifyUI } = h
  const { args = {} } = state
  const { sliceInterval, intervalDistortion, catchUp } = args
  let timeoutDelay = catchUp ? 200 : sliceInterval

  // Distort timeout interval if requested
  if (_isFinite(intervalDistortion) && !catchUp) {
    const m = Math.random() > 0.5 ? 1 : -1
    timeoutDelay *= 1 + (Math.random() * intervalDistortion * m)
  }

  const timeout = setTimeout(async () => { // schedule first tick
    /**
     * Triggers verification of the price target, and a potential atomic order
     * submit.
     *
     * @event module:bfx-hf-algo/AccumulateDistribute~selfIntervalTick
     */
    await emitSelf('interval_tick', timeoutDelay)
  }, timeoutDelay)

  await notifyUI('info', `scheduled tick in ~${(timeoutDelay / 1000).toFixed(4)}s`)

  return updateState(instance, {
    timeout,
    timeoutDelay,
    timeoutScheduledAt: Date.now()
  })
}

module.exports = {
  tick: scheduleTick
} // exported within an object so we can be mocked
