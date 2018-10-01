'use strict'

module.exports = (loadedState = {}) => {
  const { remainingAmount, args = {} } = loadedState

  return {
    remainingAmount,
    args,
  }
}
