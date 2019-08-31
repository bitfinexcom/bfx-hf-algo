'use strict'

module.exports = (state = {}) => {
  const {
    remainingAmount, orderAmounts, currentOrder, ordersBehind, args = {},
    label, name
  } = state

  return {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    label,
    name,
    args
  }
}
