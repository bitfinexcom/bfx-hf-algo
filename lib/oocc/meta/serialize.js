'use strict'

/**
 * Creates a POJO from an instance's state which can be stored as JSON in a
 * database, and later loaded with the corresponding
 * {@link module:OOCC~unserialize} method.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
 * @param {object} state - instance state to be serialized
 * @returns {object} pojo - DB-ready plain JS object
 */
const serialize = (state = {}) => {
  const { args = {}, label, name } = state

  return {
    label,
    name,
    args
  }
}

module.exports = serialize
