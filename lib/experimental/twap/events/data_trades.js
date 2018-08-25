'use strict'

const _isFinite = require('lodash/isFinite')
const Config = require('../config')

module.exports = async (instance = {}, trades) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { priceTarget, priceCondition } = args
  const { debug } = h

  debug('recv trades: %j', trades)

  if (
    !_isFinite(priceTarget) ||
    (priceCondition !== Config.PRICE_CONDITION.MATCH_LAST)
  ) {
    return
  }

  debug('TODO: MATCH LAST')
}
