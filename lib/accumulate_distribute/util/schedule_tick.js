'use strict'

const _isFinite = require('lodash/isFinite')

// Note if catching up, the delay is always 2s
const tick = async (instance, catchUp) => {
  const { state = {}, h = {} } = instance
  const { emitSelf, updateState, notifyUI } = h
  const { args = {} } = state
  const { sliceInterval, intervalDistortion } = args
  let timeoutDelay = catchUp ? 200 : sliceInterval

  // Distort timeout interval if requested
  if (_isFinite(intervalDistortion) && !catchUp) {
    const m = Math.random() > 0.5 ? 1 : -1
    timeoutDelay *= 1 + (Math.random() * intervalDistortion * m)
  }

  const timeout = setTimeout(async () => { // schedule first tick
    await emitSelf('interval_tick', timeoutDelay)
  }, timeoutDelay)

  await notifyUI('info', `scheduled tick in ~${(timeoutDelay / 1000).toFixed(4)}s`)
  await updateState(instance, {
    timeout,
    timeoutDelay,
    timeoutScheduledAt: Date.now()
  })
}

module.exports = { tick } // exported within an object so we can be mocked
