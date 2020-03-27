'use strict'

/**
 * Declares internal `self:interval_tick` event handler to the host for event
 * routing.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @param {object} instance - AO instance state
 * @param {object} host - algo host instance for event mapping
 */
const declareEvents = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  /**
   * Triggers price target comparison and a potential atomic order submit
   *
   * @event module:TWAP~selfIntervalTick
   */
  declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
}

module.exports = declareEvents
