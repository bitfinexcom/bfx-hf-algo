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
    (_isFinite(priceTarget) && ( // not explicit trade match
      (priceCondition !== Config.PRICE_COND.MATCH_LAST)
    )) || ( // not soft trade match
      (priceTarget !== Config.PRICE_TARGET.LAST)
    )
  ) {
    return
  }

  debug('TODO: MATCH LAST')
}
