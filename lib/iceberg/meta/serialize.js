'use strict'

/**
 * Creates a POJO from an instance's state which can be stored as JSON in a
 * database, and later loaded with the corresponding
 * {@link module:Iceberg~unserialize} method.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {object} state - instance state to be serialized
 * @returns {object} pojo - DB-ready plain JS object
 */
const serialize = (state = {}) => {
  const { remainingAmount, args = {}, label, name, alias } = state

  return {
    alias,
    remainingAmount,
    label,
    name,
    args
  }
}

module.exports = serialize
