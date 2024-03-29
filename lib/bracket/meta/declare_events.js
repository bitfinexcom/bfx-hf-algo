'use strict'

/**
 * Declares internal `self:submit_initial_order` and `self:self_submit_oco_order`
 * event handlers to the host for event routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Bracket
 * @param {AOInstance} instance - AO instance state
 * @param {object} host - algo host instance for event mapping
 */
module.exports = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  /**
   * Triggers the creation of the initial atomic order, as configured
   *
   * @event module:Bracket~selfSubmitInitialOrder
   */
  declareEvent(instance, host, 'self:submit_initial_order', 'submit_initial_order')

  /**
   * Triggers the creation of the OCO atomic order, as configured
   *
   * @event module:Bracket~selfSubmitOCOOrder
   */
  declareEvent(instance, host, 'self:submit_oco_order', 'submit_oco_order')
}
