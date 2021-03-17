'use strict'

const scheduleTick = async (instance) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { debug, timeout, updateState, emitSelf } = h
  const { sliceInterval } = args

  debug('scheduling interval (%f s)', sliceInterval / 1000)
  const [id, t] = timeout(sliceInterval)
  await updateState(instance, { timeout: id })
  await t()
  await emitSelf('interval_tick')
}

module.exports = {
  tick: scheduleTick
}
