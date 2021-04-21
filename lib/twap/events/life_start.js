'use strict'

const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')

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
  const { args = {} } = state
  const { priceTarget, priceCondition, orderType } = args
  const { debug, emitSelf, subscribeDataChannels } = h

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

  // TODO: use await here once awaitable feature is added
  // so first tick can operate on data already
  subscribeDataChannels(state)

  emitSelf('interval_tick') // no await, don't delay
}

module.exports = onLifeStart
