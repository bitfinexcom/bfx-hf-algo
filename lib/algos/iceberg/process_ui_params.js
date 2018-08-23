'use strict'

module.exports = (data) => {
  const params = { ...data }

  if (params.orderType && !params._margin) {
    params.orderType = `EXCHANGE ${params.orderType}`
  }

  if (params._symbol) {
    params.symbol = params._symbol
    delete params._symbol
  }

  if (!params.cancelDelay) params.cancelDelay = 1500
  if (!params.submitDelay) params.submitDelay = 5000

  if (params.action) {
    if (params.action === 'Sell') {
      params.amount = Number(params.amount) * -1
    }

    delete params.action
  }

  return params
}
