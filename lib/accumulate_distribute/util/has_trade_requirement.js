'use strict'

module.exports = (args = {}) => {
  const { relativeOffset = {}, relativeCap = {} } = args
  const offsetType = relativeOffset.type
  const capType = relativeCap.type

  return offsetType === 'trade' || capType === 'trade'
}
