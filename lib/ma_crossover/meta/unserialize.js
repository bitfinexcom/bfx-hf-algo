'use strict'

module.exports = (loadedState = {}) => {
  const { args = {}, name, label } = loadedState

  return {
    label,
    name,
    args
  }
}
