'use strict'

/**
 * Declares internal `self:submit_order` event handlers to the host for event
 * routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
 * @param {AOInstance} instance - AO instance state
 * @param {object} host - algo host instance for event mapping
 */
module.exports = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  /**
   * Triggers the creation of the configured order and stops execution
   *
   * @event module:OOCC~selfSubmitOrder
   */
  declareEvent(instance, host, 'self:submit_order', 'submit_order')
}
