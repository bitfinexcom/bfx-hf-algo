'use strict'

/**
 * @param {Randomizer} randomizer
 * @param baseCandle
 * @returns {DataProvider}
 */
module.exports = (randomizer, baseTrade) => {
  return (fields, prevTrade) => {
    const [id, mts, amount, price] = baseTrade
    const nextPrice = price + randomizer.range(-100, 100)

    return [id, mts, amount, nextPrice]
  }
}
