'use strict'

/**
 * Creates a POJO from an instance's state which can be stored as JSON in a
 * database, and later loaded with the corresponding
 * {@link module:Bracket~unserialize} method.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Bracket
 * @param {object} state - instance state to be serialized
 * @returns {object} pojo - DB-ready plain JS object
 */
const serialize = (state = {}) => {
  const { args = {}, label, name, initialOrderFilled, alias } = state

  return {
    alias,
    label,
    name,
    args,
    initialOrderFilled
  }
}

module.exports = serialize
