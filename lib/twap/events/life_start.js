'use strict'

const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')
const getMinMaxDistortedAmount = require('../../util/get_min_max_distorted_amount')

/**
 * Sets up the `self:interval_tick` interval and saves it on the state.
 *
 * @memberOf module:TWAP
 * @listens AOHost~lifeStart
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, pairConfig } = state
  const { priceTarget, priceCondition, orderType } = args
  const { debug, emitSelf, updateState, subscribeDataChannels } = h

  if (!/MARKET/.test(orderType)) {
    if (_isFinite(priceTarget) && _isString(priceCondition)) {
      debug('running in condition monitoring mode (%s = %f)', priceCondition, priceTarget)
    } else if (_isString(priceTarget)) {
      debug('running in soft match mode (%s)', priceTarget)
    } else {
      debug('can\'t start, invalid operating mode (target %s, condition %s)', priceTarget, priceCondition)
      return
    }
  }

  const { minDistortedAmount, maxDistortedAmount } = getMinMaxDistortedAmount(args, pairConfig)

  await updateState(instance, { minDistortedAmount, maxDistortedAmount })

  try {
    await subscribeDataChannels(state, { timeout: 30 * 1000 })
    emitSelf('interval_tick') // no await, don't delay
  } catch (e) {
    debug('failed to subscribe to data channels: %s', e.message)
  }
}

module.exports = onLifeStart
