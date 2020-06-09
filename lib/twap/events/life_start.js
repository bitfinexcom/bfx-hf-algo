'use strict'

const _isFinite = require('lodash/isFinite')
const _isString = require('lodash/isString')

/**
 * Sets up the `self:interval_tick` interval and saves it on the state.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @listens AOHost~lifeStart
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { sliceInterval, priceTarget, priceCondition, orderType } = args
  const { debug, emitSelf, updateState } = h

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

  const interval = setInterval(async () => {
    await emitSelf('interval_tick')
  }, sliceInterval)

  debug('scheduled interval (%f s)', sliceInterval / 1000)

  await updateState(instance, { interval })
}

module.exports = onLifeStart
