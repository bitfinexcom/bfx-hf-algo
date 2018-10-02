'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (data) => {
  const params = { ...data }

  if (params.orderType && !params._margin) {
    params.orderType = `EXCHANGE ${params.orderType}`
  }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params.cancelDelay) {
    params.cancelDelay = 1500
  }

  if (!params.submitDelay) {
    params.submitDelay = 5000
  }

  if (params.priceTarget === 'custom') {
    params.priceTarget = params.price
  }

  if (_isFinite(params.priceDelta)) {
    params.priceDelta = Math.abs(params.priceDelta)
  } else {
    params.priceDelta = 0
  }

  if (_isFinite(params.sliceInterval)) {
    params.sliceInterval = Number(params.sliceInterval) * 1000
  }

  delete params.price

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = Number(params.amount) * -1
      params.sliceAmount = Number(params.sliceAmount) * -1
    }

    delete params.action
  }

  return params
}
