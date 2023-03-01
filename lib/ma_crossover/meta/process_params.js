'use strict'

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by an MACrossover instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossover
 * @param {object} data - raw parameters from an UI
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params._futures) {
    delete params.lev
  }

  if (params.orderType !== 'LIMIT') {
    params.orderPrice = 0
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
    if (params.action === 'sell') {
      params.amount = (+params.amount) * -1
    }
  }

  return params
}

module.exports = processParams
