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

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = (+params.amount) * -1
    }

    delete params.action
  }

  if (params.ocoAction) {
    if (params.ocoAction === 'Sell') {
      params.ocoAmount = (+params.ocoAmount) * -1
    }

    delete params.ocoAction
  }

  return params
}
