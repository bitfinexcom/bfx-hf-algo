'use strict'

module.exports = (instance = {}, host) => {
  const { h = {} } = instance
  const { declareEvent } = h

  declareEvent(instance, host, 'self:submit_orders', 'self.submit_orders')
}
