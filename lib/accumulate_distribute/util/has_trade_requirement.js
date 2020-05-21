'use strict'

/**
 * Utility function that checks if a set of execution parameters require trade
 * data for price cap or offset calculation.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {boolean} hasTradeRequirement
 */
const hasTradeRequirement = (args = {}) => {
  const { relativeOffset = {}, relativeCap = {} } = args
  const offsetType = relativeOffset.type
  const capType = relativeCap.type

  return offsetType === 'trade' || capType === 'trade'
}

module.exports = hasTradeRequirement
