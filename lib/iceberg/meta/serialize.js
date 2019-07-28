'use strict'

module.exports = (state = {}) => {
  const { remainingAmount, args = {}, label, name } = state

  return {
    remainingAmount,
    label,
    name,
    args
  }
}
