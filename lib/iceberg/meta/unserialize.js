'use strict'

module.exports = (loadedState = {}) => {
  const { remainingAmount, args = {}, label, name } = loadedState

  return {
    remainingAmount,
    label,
    name,
    args
  }
}
