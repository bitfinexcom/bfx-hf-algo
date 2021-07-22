'use strict'

const { expect } = require('chai')

/**
 * Utility functions for chai
 */

/**
 * Assert promise rejection
 *
 * @param {Promise?} promise
 * @param {string?} message
 */
async function toBeRejected (promise, message) {
  try {
    await promise
  } catch (err) {
    expect(err).to.be.an('error')
    return
  }
  expect.fail(message)
}

module.exports = {
  toBeRejected
}
