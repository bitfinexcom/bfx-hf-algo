'use strict'

const _isEmpty = require('lodash/isEmpty')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {} } = state
  const { priceTarget, priceCondition, tradeBeyondEnd, cancelDelay } = args
  const { emit, debug } = h

  if (!tradeBeyondEnd && !_isEmpty(orders)) {
    await emit('exec:orders:cancel:all', instance, cancelDelay, orders)
  }

  debug('tick')
}
