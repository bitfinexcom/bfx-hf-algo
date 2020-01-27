'use strict'

const { getRoundTripSymbols } = require('../util/symbols')
const _isFinite = require('lodash/isFinite')

module.exports = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol1 = params._symbol.replace('t', '')
    delete params._symbol
  }

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = Number(params.amount) * -1
    } else {
      params.amount = Number(params.amount)
    }
    delete params.action
  }

  // compile ending symbol using
  // starting currency and intermediate market
  const rawSymbol = params.symbol1
  const midCcy = params.intermediateCcy

  const isBuy = params.amount > 0
  const { interMarket, finalMarket } = getRoundTripSymbols(rawSymbol, midCcy, isBuy)
  params.symbol2 = interMarket
  params.symbol3 = finalMarket

  if (params.cancelDelaySec) {
    params.cancelDelay = params.cancelDelaySec * 1000
    delete params.cancelDelaySec
  }

  if (params.submitDelaySec) {
    params.submitDelay = params.submitDelaySec * 1000
    delete params.submitDelaySec
  }

  if (!_isFinite(params.cancelDelay)) {
    params.cancelDelay = 1000
  }

  if (!_isFinite(params.submitDelay)) {
    params.submitDelay = 2000
  }

  return params
}
