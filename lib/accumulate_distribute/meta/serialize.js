'use strict'

module.exports = (state = {}) => {
  const {
    remainingAmount, orderAmounts, currentOrder, ordersBehind, args = {}
  } = state

  return {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    args,
  }
}
