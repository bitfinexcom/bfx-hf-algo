'use strict'

const hasOpenOrders = require('../../util/has_open_orders')
const scheduleTick = require('../util/schedule_tick')

/**
 * Mapped to the `self:interval_tick` event and triggered by the instance
 * itself.
 *
 * Schedules the next tick, and updates the orders-behind count on the instance
 * state if an order is currently open (meaning it has not filled in its
 * allocated window).
 *
 * If `awaitFill` is `false`, the open order is cancelled and will be replaced
 * by the new order on the next tick. Otherwise nothing is done in order to
 * await a fill.
 *
 * @memberOf module:AccumulateDistribute
 * @listens module:AccumulateDistribute~event:selfIntervalTick
 * @fires module:AccumulateDistribute~selfSubmitOrder
 * @see module:AccumulateDistribute.scheduleTick
 *
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onSelfIntervalTick = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid, ordersBehind, orderAmounts, currentOrder } = state
  const { emit, emitSelf, debug, updateState } = h
  const { awaitFill } = args

  if (hasOpenOrders(orders)) { // prev order still open
    const nextOrdersBehind = Math.min(orderAmounts.length - currentOrder, ordersBehind + 1)
    await updateState(instance, { // for catching up
      ordersBehind: nextOrdersBehind
    })

    debug('now behind with %d orders', nextOrdersBehind)

    if (!awaitFill) { // cancel current order if not awaiting fill
      await emit('exec:order:cancel:all', gid, orders)
    } else {
      debug('awaiting fill...')
      scheduleTick.tick(instance)

      return // await order fill, then rely on ordersBehind
    }
  }

  /**
   * Triggers generation of the configured atomic slice, and submits it
   *
   * @see module:AccumulateDistribute~generateOrder
   * @event module:AccumulateDistribute~selfSubmitOrder
   */
  await emitSelf('submit_order') // submit next slice order
  scheduleTick.tick(instance)
}

module.exports = onSelfIntervalTick
