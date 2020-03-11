'use strict'

/**
 * Declares the internal `self:submit_order` handler to the host for event
 * routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossover
 * @param {object} instance - AO instance state
 * @param {object} host - algo host instance for event mapping
 */
const declareEvents = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  declareEvent(instance, host, 'self:submit_order', 'submit_order')
}

module.exports = declareEvents
