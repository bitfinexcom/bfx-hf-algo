'use strict'

const { nBN } = require('@bitfinex/lib-js-util-math')

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by an Iceberg instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} data - raw parameters from an UI
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data) => {
  const params = { ...data }

  if (params.orderType && !params._margin && !params._futures) {
    params.orderType = `EXCHANGE ${params.orderType}`
  }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params._futures) {
    delete params.lev
  }

  if (params.submitDelaySec) {
    params.submitDelay = params.submitDelaySec * 1000
    delete params.submitDelaySec
  }

  if (!params.submitDelay) {
    params.submitDelay = 2000
  }

  if (params.sliceAmountPerc) {
    params.sliceAmount = nBN(params.amount).multipliedBy(params.sliceAmountPerc).toNumber()
    delete params.sliceAmountPerc
  }

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = Number(params.amount) * -1
      params.sliceAmount = Number(params.sliceAmount) * -1
    }

    delete params.action
  }

  return params
}

module.exports = processParams
