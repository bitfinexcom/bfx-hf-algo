'use strict'

module.exports = (args = {}) => {
  const { relativeOffset = {} } = args
  const { type } = relativeOffset

  return (type === 'ma' || type === 'ema')
}
