'use strict'

module.exports = (args = {}) => {
  const { amount } = args

  return {
    interval: null,
    remainingAmount: amount,
    args
  }
}
