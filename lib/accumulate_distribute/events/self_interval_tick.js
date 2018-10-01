'use strict'

const hasOpenOrders = require('../../util/has_open_orders')
const scheduleTick = require('../util/schedule_tick')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid, ordersBehind, orderAmounts, currentOrder } = state
  const { emit, emitSelf, debug, updateState } = h
  const {
    awaitFill, cancelDelay
  } = args

  await scheduleTick(instance)

  if (hasOpenOrders(orders)) { // prev order still open
    const nextOrdersBehind = Math.min(orderAmounts.length - currentOrder, ordersBehind + 1)
    await updateState(instance, { // for catching up
      ordersBehind: nextOrdersBehind
    })

    debug('now behind with %d orders', nextOrdersBehind)

    if (!awaitFill) { // cancel current order if not awaiting fill
      await emit('exec:order:cancel:all', gid, orders, cancelDelay)
    } else {
      debug('awaiting fill...')
      return // await order fill, then rely on ordersBehind
    }
  }

  await emitSelf('submit_order') // submit next slice order
}
