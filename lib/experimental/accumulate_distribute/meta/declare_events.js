'use strict'

module.exports = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  declareEvent(instance, host, 'self:submit_order', 'submit_order')
  declareEvent(instance, host, 'self:interval_tick', 'interval_tick')
}
