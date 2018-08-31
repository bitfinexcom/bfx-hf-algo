'use strict'

module.exports = (args = {}) => {
  const { amount } = args

  return {
    remainingAmount: amount,
    args
  }
}
