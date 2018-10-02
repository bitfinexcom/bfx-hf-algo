'use strict'

module.exports = (state = {}, order = {}) => {
  const { args = {} } = state
  const { price, sliceAmount, excessAsHidden } = args
  const { amount } = order
  const mul = amount < 0 ? -1 : 1

  return {
    label: [
      'Iceberg',
      ` | ${amount} @ ${price} `,
      ` | slice ${mul * sliceAmount}`,

      excessAsHidden
        ? ` | excess ${mul * (Math.abs(amount) - Math.abs(sliceAmount))}`
        : ''
    ].join('')
  }
}
