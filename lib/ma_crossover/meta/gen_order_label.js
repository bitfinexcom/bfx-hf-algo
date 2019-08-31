'use strict'

module.exports = (state = {}) => {
  const { args = {} } = state
  const { orderType, orderPrice, amount, long, short } = args

  return [
    'MA Crossover',
    ` | ${amount} @ ${orderPrice || orderType} `,
    ` | long ${long.type.toUpperCase()}(${long.args[0]})`,
    ` | short ${short.type.toUpperCase()}(${short.args[0]})`
  ].join('')
}
