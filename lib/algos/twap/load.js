'use strict'

const TWAPOrder = require('./index')

module.exports = (ws, rest, data) => {
  try {
    const o = new TWAPOrder(ws, rest, data)

    o.remainingAmount = data.remainingAmount

    if (typeof data.orderModifier === 'string' && data.orderModifier.length > 0) {
      // eslint-disable-next-line no-new-func
      o.orderModifier = Function(data.orderModifier) // hacky, but it works
    }

    return o
  } catch (e) {
    return e
  }
}
