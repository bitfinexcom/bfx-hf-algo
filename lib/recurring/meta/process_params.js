'use strict'

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by a PingPong instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} data - raw parameters from an UI
 * @param {object} currentMarket - the object of a current market
 * @returns {object} parameters - ready to be passed to a fresh instance
 */
const processParams = (data, currentMarket) => {
  const params = { ...data }
  const { base, quote, wsID } = currentMarket
  params._symbol = wsID
   
  if (params.currency === '$BASE') {
    params.currency = base
  } else if (params.currency === '$QUOTE') {
    params.currency = quote
  }

  if (!params.startedAt) {
    params.startedAt = new Date()
  }

  if (!params.endedAt) {
    delete params.endedAt
  } else {
    delete params.endless
  }

  return params
}

module.exports = processParams
