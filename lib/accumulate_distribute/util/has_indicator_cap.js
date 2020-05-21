'use strict'

/**
 * Utility function that checks if a set of execution parameters require an
 * indicator for price cap calculation.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {boolean} hasIndicatorCap
 */
const hasIndicatorCap = (args = {}) => {
  const { relativeCap = {} } = args
  const { type } = relativeCap

  return (type === 'ma' || type === 'ema')
}

module.exports = hasIndicatorCap
