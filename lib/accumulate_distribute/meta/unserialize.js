'use strict'

/**
 * Converts a loaded POJO into a state object ready for live execution.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} loadedState - data from a DB
 * @returns {object} instanceState - ready for execution
 */
const unserialize = (loadedState = {}) => {
  const {
    remainingAmount, orderAmounts, currentOrder, ordersBehind, args = {},
    name, label
  } = loadedState

  return {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    label,
    name,
    args
  }
}

module.exports = unserialize
