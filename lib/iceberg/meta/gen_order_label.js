'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const { amount, price, sliceAmount, excessAsHidden } = args
  const mul = amount < 0 ? -1 : 1

  return [
    'Iceberg',
    ` | ${amount} @ ${price} `,
    ` | slice ${mul * sliceAmount}`,

    excessAsHidden
      ? ` | excess ${mul * (Math.abs(amount) - Math.abs(sliceAmount))}`
      : ''
  ].join('')
}
