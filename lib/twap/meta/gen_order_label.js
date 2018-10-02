'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const {
    sliceAmount, sliceInterval, amount, priceTarget, priceCondition,
    tradeBeyondEnd
  } = args

  return [
    'TWAP',
    ' | slice ', sliceAmount,
    ' | total ', amount,
    ' | interval ', Math.floor(sliceInterval / 1000), 's',
    ' | target ', priceTarget,
    ' | target == ', priceCondition,
    ' | TBE ', tradeBeyondEnd
  ].join('')
}
