'use strict'

const { prepareAmount } = require('bfx-api-node-util')

module.exports = (min, max) => {
  return +prepareAmount(Math.random() * (max - min) + min) // Generate random number between min and max
}
