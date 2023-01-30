'use strict'

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by an Bracket instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Bracket
 * @param {object} data - raw parameters from an UI
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data) => {
  const params = { ...data }

  if (params.orderType !== 'LIMIT') {
    params.postonly = false
  }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params._futures) {
    delete params.lev
  }

  if (!params.hidden) {
    delete params.visibleOnHit
  }

  if (params.action) {
    if (params.action === 'sell') {
      params.amount = (+params.amount) * -1
    }
  }

  if (params.ocoAction) {
    if (params.ocoAction === 'sell') {
      params.ocoAmount = (+params.ocoAmount) * -1
    }
  }

  return params
}

module.exports = processParams
