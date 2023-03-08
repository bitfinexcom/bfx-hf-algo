'use strict'

/**
 * Creates a POJO from an instance's state which can be stored as JSON in a
 * database, and later loaded with the corresponding
 * {@link module:AccumulateDistribute~unserialize} method.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} state - instance state to be serialized
 * @returns {object} pojo - DB-ready plain JS object
 */
const serialize = (state = {}) => {
  const {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    alias,
    args = {},
    label,
    name
  } = state

  return {
    remainingAmount,
    orderAmounts,
    currentOrder,
    ordersBehind,
    alias,
    label,
    name,
    args
  }
}

module.exports = serialize
