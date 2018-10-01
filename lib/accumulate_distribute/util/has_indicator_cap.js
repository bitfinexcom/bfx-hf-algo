'use strict'

module.exports = (args = {}) => {
  const { relativeCap = {} } = args
  const { type } = relativeCap

  return (type === 'ma' || type === 'ema')
}
