'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const { orderType, amount, limitPrice, sliceAmount, sliceInterval } = args

  const labelParts = [
    'A/D',
    ` | ${amount} @ ${limitPrice || orderType} `,
    ` | slice ${sliceAmount}`,
    ' | interval ', Math.floor(sliceInterval / 1000), 's',
  ]

  if (orderType === 'LIMIT') {
    labelParts.push(` | LIMIT ${args.limitPrice}`)
  } else if (orderType === 'MARKET') {
    labelParts.push(' | MARKET')
  } else {
    labelParts.push(` | Offset ${args.relativeOffset.type.toUpperCase()}`)
    labelParts.push(` | Cap ${args.relativeCap.type.toUpperCase()}`)
  }

  return labelParts.join('')
}
