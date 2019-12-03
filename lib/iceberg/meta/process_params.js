'use strict'

module.exports = (data) => {
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

  if (params.cancelDelaySec) {
    params.cancelDelay = params.cancelDelaySec * 1000
    delete params.cancelDelaySec
  }

  if (params.submitDelaySec) {
    params.submitDelay = params.submitDelaySec * 1000
    delete params.submitDelaySec
  }

  if (!params.cancelDelay) {
    params.cancelDelay = 1000
  }

  if (!params.submitDelay) {
    params.submitDelay = 2000
  }

  if (params.sliceAmountPerc) {
    params.sliceAmount = params.amount * (+params.sliceAmountPerc)
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
