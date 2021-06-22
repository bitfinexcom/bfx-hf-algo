'use strict'

/**
 * @param {Randomizer} randomizer
 * @param {number[]} baseBook
 * @returns {DataProvider}
 */
module.exports = (randomizer, baseBook) => {
  return (fields, prevBook) => {
    const [price, rate, period, count, amount] = prevBook || baseBook
    const variation = randomizer.range(-100, 100)
    return [[price + variation, rate, period, count, amount]]
  }
}
