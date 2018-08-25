'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { sliceInterval, priceTarget, priceCondition } = args
  const { debug, emitSelf, updateState } = h

  if (!_isFinite(priceTarget)) {
    debug('running in scheduled mode')

    const interval = setInterval(async () => {
      await emitSelf('interval_tick')
    }, sliceInterval)

    await updateState(instance, { interval })
  } else {
    debug('running in condition monitoring mode (%s', priceCondition)
  }
}
