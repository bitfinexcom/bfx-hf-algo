'use strict'

/**
 * Declares the internal `self:submit_order` handler to the host for event
 * routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/MACrossover
 * @see module:bfx-hf-algo/MACrossover.onSelfSubmitOrder
 *
 * @param {AOInstance} instance - AO instance state
 * @param {AOHost} host - algo host instance for event mapping
 */
const declareEvents = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  /**
   * Triggers atomic order creation and teardown
   *
   * @event module:bfx-hf-algo/MACrossover~selfSubmitOrder
   */
  declareEvent(instance, host, 'self:submit_order', 'submit_order')
}

module.exports = declareEvents
