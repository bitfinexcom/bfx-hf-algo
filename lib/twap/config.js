'use strict'

const config = {}
const priceTargets = ['LAST', 'OB_MID', 'OB_SIDE']
const priceConditions = ['MATCH_MIDPOINT', 'MATCH_SIDE', 'MATCH_LAST']

config.PRICE_TARGET = {}
config.PRICE_COND = {}

priceTargets.forEach(t => { config.PRICE_TARGET[t] = t })
priceConditions.forEach(c => { config.PRICE_COND[c] = c })

module.exports = config
