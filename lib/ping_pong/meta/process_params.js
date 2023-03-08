'use strict'

/**
 * Converts a raw parameters Object received from an UI into a parameters
 * Object which can be used by a PingPong instance for execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
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

  if (!params.splitPingPongAmount) {
    params.pingAmount = params.amount
    params.pongAmount = params.amount
  }

  if (params.action) {
    if (params.action === 'sell') {
      params.pingAmount = Number(params.pingAmount) * -1
      params.pongAmount = Number(params.pongAmount) * -1
    }

    delete params.action
  }

  return params
}

module.exports = processParams
