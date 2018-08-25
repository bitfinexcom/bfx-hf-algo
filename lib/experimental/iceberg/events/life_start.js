'use strict'

module.exports = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  emitSelf('submit_orders')
}
