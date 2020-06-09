'use strict'

let last = Date.now()

/**
 * @private
 *
 * @returns {number} cid
 */
const genClientID = () => {
  const now = Date.now()
  last = (last < now) ? now : last + 1
  return last
}

module.exports = genClientID
