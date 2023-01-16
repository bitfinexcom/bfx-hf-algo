'use strict'

const _isFinite = require('lodash/isFinite')
const validationErrObj = require('../../util/validate_params_err')
const { apply: applyI18N } = require('../../util/i18n')

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid PingPong order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @param {object} args - incoming parameters
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args) => {
  const { amount } = args
  if (!_isFinite(amount) || amount === 0) {
    return applyI18N(
      validationErrObj('amount', 'Invalid amount'),
      'invalidAmount'
    )
  }

  return null
}

module.exports = validateParams
