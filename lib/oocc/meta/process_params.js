'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by an OOCC instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
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

  if (params.submitDelaySec) {
    params.submitDelay = params.submitDelaySec * 1000
    delete params.submitDelaySec
  }

  if (!_isFinite(params.submitDelay)) {
    params.submitDelay = 2000
  }

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = (+params.amount) * -1
    }
  }

  if (/STOP/.test(params.orderType) || params.oco) {
    params.stopPrice = params.stopPriceStopLimit || params.stopPriceOCO
  }

  return params
}

module.exports = processParams
