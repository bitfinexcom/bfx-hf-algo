'use strict'

/**
 * Declares internal `self:submit_order` and `self:interval_tick` event
 * handlers to the host for event routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 *
 * @param {AOInstance} instance - AO instance state
 * @param {AOHost} host - algo host instance for event mapping
 */
const declareEvents = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  declareEvent(instance, host, 'self:submit_order', 'submit_order')
  declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
}

module.exports = declareEvents
