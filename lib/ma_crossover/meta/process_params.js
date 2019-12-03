'use strict'

module.exports = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params._futures) {
    delete params.lev
  }

  if (!params.cancelDelay) {
    params.cancelDelay = 1500
  }

  if (!params.submitDelay) {
    params.submitDelay = 5000
  }

  params.long = { type: params.longType.toLowerCase() }
  params.short = { type: params.shortType.toLowerCase() }

  if (params.long.type === 'ema') {
    params.long.candlePrice = params.longEMAPrice.toLowerCase()
    params.long.candleTimeFrame = params.longEMATF
    params.long.args = [+params.longEMAPeriod]
  } else {
    params.long.candlePrice = params.longMAPrice.toLowerCase()
    params.long.candleTimeFrame = params.longMATF
    params.long.args = [+params.longMAPeriod]
  }

  if (params.short.type === 'ema') {
    params.short.candlePrice = params.shortEMAPrice.toLowerCase()
    params.short.candleTimeFrame = params.shortEMATF
    params.short.args = [+params.shortEMAPeriod]
  } else {
    params.short.candlePrice = params.shortMAPrice.toLowerCase()
    params.short.candleTimeFrame = params.shortMATF
    params.short.args = [+params.shortMAPeriod]
  }

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = (+params.amount) * -1
    }

    delete params.action
  }

  return params
}
