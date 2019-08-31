'use strict'

module.exports = (loadedState = {}) => {
  const {
    remainingAmount, orderAmounts, currentOrder, ordersBehind, args = {},
    name, label
  } = loadedState

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
