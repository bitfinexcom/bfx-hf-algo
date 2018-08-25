'use strict'

module.exports = (state = {}, order = {}) => {
  const { args = {} } = state
  const {
    sliceAmount, sliceInterval, amount, priceTarget, priceCondition,
    tradeBeyondEnd
  } = args

  return {
    label: [
      'TWAP',
      ' | slice ', sliceAmount,
      ' | total ', amount,
      ' | interval ', Math.floor(sliceInterval / 1000), 's',
      ' | target ', priceTarget,
      ' | target == ', priceCondition,
      ' | TBE ', tradeBeyondEnd
    ].join('')
  }
}
