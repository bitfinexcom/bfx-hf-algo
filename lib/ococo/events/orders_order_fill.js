'use strict'

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { updateState, emitSelf } = h
  const { initialOrderFilled } = state

  if (initialOrderFilled) {
    await emitSelf('exec:stop')
  } else {
    await updateState(instance, { initialOrderFilled: true })
    await emitSelf('submit_oco_order')
  }
}
