'use strict'

const _isFinite = require('lodash/isFinite')

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by TWAP instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} data - raw parameters from an UI
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data) => {
  const params = { ...data }

  if (params.orderType && !params._margin) {
    params.orderType = `EXCHANGE ${params.orderType}`
  }

  if (!params._futures) {
    delete params.lev
  }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (_isFinite(params.cancelDelaySec)) {
    params.cancelDelay = params.cancelDelaySec * 1000
    delete params.cancelDelaySec
  }

  if (_isFinite(params.submitDelaySec)) {
    params.submitDelay = params.submitDelaySec * 1000
    delete params.submitDelaySec
  }

  if (!_isFinite(params.cancelDelay)) {
    params.cancelDelay = 1000
  }

  if (!_isFinite(params.submitDelay)) {
    params.submitDelay = 2000
  }

  if (params.priceTarget === 'CUSTOM') {
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

module.exports = processParams
