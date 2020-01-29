'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { updateState, emitSelf } = h
  const { initialOrderFilled } = state

  if (order.amount > DUST) { // partial fill
    return
  }

  if (initialOrderFilled) {
    await emitSelf('exec:stop')
  } else {
    await updateState(instance, { initialOrderFilled: true })
    await emitSelf('submit_oco_order')
  }
}
