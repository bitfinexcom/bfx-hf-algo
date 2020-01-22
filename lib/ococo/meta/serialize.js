'use strict'

module.exports = (state = {}) => {
  const { args = {}, label, name } = state

  return {
    label,
    name,
    args
  }
}
