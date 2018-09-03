'use strict'

const _isFinite = require('lodash/isFinite')

// Note if catching up, the delay is always 2s
module.exports = async (instance, catchUp) => {
  const { state = {}, h = {} } = instance
  const { emitSelf, updateState, debug } = h
  const { args = {} } = state
  const { sliceInterval, intervalDistortion } = args
  let timeoutDelay = catchUp ? 2000 : sliceInterval

  // Distort timeout interval if requested
  if (_isFinite(intervalDistortion) && !catchUp) {
    const m = Math.random() > 0.5 ? 1 : -1
    timeoutDelay *= 1 + (Math.random() * intervalDistortion * m)
  }

  const timeout = setTimeout(async () => { // schedule first tick
    await emitSelf('interval_tick')
  }, timeoutDelay)

  debug('scheduled tick in %f s', timeoutDelay / 1000)

  await updateState(instance, {
    timeout,
    timeoutDelay,
    timeoutScheduledAt: Date.now()
  })
}
