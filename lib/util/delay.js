'use strict'

const Promise = require('bluebird')

/**
 * Resolves after a specified number of millisecondso
 *
 * @param {number} ms
 * @return {Promise} p
 */
module.exports = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
