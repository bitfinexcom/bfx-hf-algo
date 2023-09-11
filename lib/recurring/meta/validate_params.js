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
 * @param {number} args.amount - individual recurring order amount
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args) => {
  const { amount, endless, endedAt } = args
  if (!_isFinite(amount) || amount === 0) {
    return applyI18N(
      validationErrObj('amount', 'Invalid amount'),
      'invalidAmount'
    )
  }

  if (!endless && !endedAt) {
    return applyI18N(validationErrObj('endedAt', 'End Date must be specified'), 'endDateRequired')
  }

  return null
}

module.exports = validateParams
