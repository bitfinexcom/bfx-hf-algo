'use strict'

const _isFinite = require('lodash/isFinite')
const Config = require('../config')

module.exports = async (instance = {}, update) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { priceTarget, priceCondition } = args
  const { debug } = h
 
  debug('recv book: %j', update)

  if (
    (_isFinite(priceTarget) && ( // not explicit book match
      (priceCondition !== Config.PRICE_CONDITION.MATCH_SIDE) &&
      (priceCondition !== Config.PRICE_CONDITION.MATCH_MIDPOINT)
    )) || ( // not soft book match
      (priceTarget !== Config.PRICE_TARGET.OB_MID) &&
      (priceTarget !== Config.PRICE_TARGET.OB_SIDE)
    )
  ) {
    return
  }

  debug('TODO: MATCH MIDPOINT/SIDE')
}
