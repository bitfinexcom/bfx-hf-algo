'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, orderPrice, amount, ocoAmount, limitPrice, stopPrice
  } = args

  return [
    'OCOCO',
    ` | ${amount} @ ${orderPrice || orderType} `,
    ` | triggers ${ocoAmount} @ ${limitPrice} (stop ${stopPrice})`
  ].join('')
}
