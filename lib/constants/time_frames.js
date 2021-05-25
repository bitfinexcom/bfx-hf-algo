'use strict'

const oneMinute = 60 * 1000
const oneHour = 60 * oneMinute
const oneDay = 24 * oneHour

module.exports = Object.freeze({
  '1m': oneMinute,
  '5m': 5 * oneMinute,
  '15m': 15 * oneMinute,
  '30m': 30 * oneMinute,
  '1h': oneHour,
  '3h': 3 * oneHour,
  '6h': 6 * oneHour,
  '12h': 12 * oneHour,
  '1D': oneDay,
  '7D': 7 * oneDay,
  '14D': 14 * oneDay,
  '1M': 30 * oneDay
})
