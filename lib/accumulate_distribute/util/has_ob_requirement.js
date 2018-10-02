'use strict'

module.exports = (args = {}) => {
  const { relativeOffset = {}, relativeCap = {} } = args
  const offsetType = relativeOffset.type
  const capType = relativeCap.type

  return (
    (offsetType === 'bid' || offsetType === 'ask' || offsetType === 'mid') ||
    (capType === 'bid' || capType === 'ask' || capType === 'mid')
  )
}
