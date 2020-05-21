'use strict'

/**
 * Utility function that checks if a set of execution parameters require an
 * indicator for price offset calculation.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {boolean} hasIndicatorOffset
 */
const hasIndicatorOffset = (args = {}) => {
  const { relativeOffset = {} } = args
  const { type } = relativeOffset

  return (type === 'ma' || type === 'ema')
}

module.exports = hasIndicatorOffset
