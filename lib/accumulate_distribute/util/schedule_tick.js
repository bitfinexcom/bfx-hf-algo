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
 * @memberOf module:AccumulateDistribute
 * @see module:AccumulateDistribute~onSelfIntervalTick
 * @fires module:AccumulateDistribute.selfIntervalTick
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const scheduleTick = async (instance) => {
  const { state = {}, h = {} } = instance
  const { emitSelf, updateState, timeout, notifyUI } = h
  const { args = {} } = state
  const { sliceInterval, intervalDistortion, catchUp } = args
  let timeoutDelay = catchUp ? 200 : sliceInterval

  // Distort timeout interval if requested
  if (_isFinite(intervalDistortion) && !catchUp) {
    const m = Math.random() > 0.5 ? 1 : -1
    timeoutDelay *= 1 + (Math.random() * intervalDistortion * m)
  }

  await notifyUI('info', `scheduled tick in ~${(timeoutDelay / 1000).toFixed(4)}s`)

  const [id, t] = timeout(timeoutDelay)
  await updateState(instance, { timeout: id, timeoutDelay, timeoutScheduledAt: Date.now() })
  await t()

  await emitSelf('interval_tick')
}

module.exports = {
  tick: scheduleTick
} // exported within an object so we can be mocked
