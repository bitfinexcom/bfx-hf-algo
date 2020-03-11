'use strict'

/**
 * Declares internal `self:submit_orders` event handler to the host for event
 * routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @param {AOInstance} instance - AO instance state
 * @param {AOHost} host - algo host instance for event mapping
 */
const declareEvents = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  /**
   * Triggers order submit for both the slice and remainder if configured.
   *
   * @event module:Iceberg~event:selfSubmitOrders
   */
  declareEvent(instance, host, 'self:submit_orders', 'submit_orders')
}

module.exports = declareEvents
