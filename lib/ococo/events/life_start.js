'use strict'

module.exports = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  await emitSelf('submit_initial_order')
}
