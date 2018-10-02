'use strict'

module.exports = (loadedState = {}) => {
  const {
    remainingAmount, orderAmounts, currentOrder, ordersBehind, args = {}
  } = loadedState

  return {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    args
  }
}
