'use strict'

module.exports = (state = {}) => {
  const { remainingAmount, args = {} } = state

  return {
    remainingAmount,
    args,
  }
}
