'use strict'

module.exports = async (instance = {}, o) => {
  const { h = {} } = instance
  const { emit, debug } = h

  debug('received minimum size error for order: %f @ %f', o.amountOrig, o.price)
  debug('stopping order...')

  await emit('exec:stop')
}
