'use strict'

/**
 * @param {Randomizer} randomizer
 * @param {number[]} baseBook
 * @returns {DataProvider}
 */
module.exports = (randomizer, baseBook) => {
  return (fields, prevBook) => {
    if (!prevBook) {
      return baseBook
    }
    const [id, price, amount] = baseBook[0]
    const variation = randomizer.range(-100, 100)
    const amountOffset = randomizer.range(-5, 0)

    return [id, price + variation, amount + amountOffset]
  }
}
