'use strict'

const { getDateInShortFormat } = require('../../util/date')

/**
 * Generates a label for a Recurring instance for rendering in an UI.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Recurring
 * @param {object} state - source instance state
 * @param {object} state.args - source instance execution parameters
 * @returns {string} label
 */
const genOrderLabel = (state = {}) => {
  const { args = {} } = state
  const { recurrence, startedAt, endedAt, amount, action } = args
  const startedAtString = getDateInShortFormat(startedAt)
  const endedAtString = endedAt ? getDateInShortFormat(endedAt) : '∞ (endless)'
  return `Recurring | ${action.toUpperCase()} ${amount} @ ${startedAtString} -> ${endedAtString} @ ${recurrence}`
}

module.exports = genOrderLabel
