'use strict'

/**
 * Utility function that checks if a set of execution parameters require order
 * book data for price cap or offset calculation.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {boolean} hasOBRequirement
 */
const hasOBRequirement = (args = {}) => {
  const { relativeOffset = {}, relativeCap = {} } = args
  const offsetType = relativeOffset.type
  const capType = relativeCap.type

  return (
    (offsetType === 'bid' || offsetType === 'ask' || offsetType === 'mid') ||
    (capType === 'bid' || capType === 'ask' || capType === 'mid')
  )
}

module.exports = hasOBRequirement
