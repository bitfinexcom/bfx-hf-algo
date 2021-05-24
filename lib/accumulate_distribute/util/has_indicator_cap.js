'use strict'

/**
 * Utility function that checks if a set of execution parameters require an
 * indicator for price cap calculation.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {boolean} hasIndicatorCap
 */
const hasIndicatorCap = (args = {}) => {
  const { relativeCap = {} } = args
  const { type } = relativeCap

  return (type === 'sma' || type === 'ema')
}

module.exports = hasIndicatorCap
