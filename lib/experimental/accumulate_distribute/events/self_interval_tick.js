'use strict'

const _isEmpty = require('lodash/isEmpty')
const scheduleTick = require('../util/schedule_tick')

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { orders = {}, args = {}, gid, ordersBehind } = state
  const { emit, emitSelf, debug, updateState } = h
  const {
    awaitFill
  } = args

  await scheduleTick(instance)

  if (!_isEmpty(orders)) { // prev order still open
    await updateState(instance, { // for catching up
      ordersBehind: ordersBehind + 1
    })

    if (!awaitFill) { // cancel current order if not awaiting fill
      await emit('exec:order:cancel:all', gid, orders, cancelDelay)
    } else {
      return // await order fill, then rely on ordersBehind
    }
  }

  await emitSelf('submit_order') // submit next slice order
}
