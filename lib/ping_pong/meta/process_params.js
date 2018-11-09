'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (data) => {
  const params = { ...data }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

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

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = Number(params.amount) * -1
    }

    delete params.action
  }

  return params
}
