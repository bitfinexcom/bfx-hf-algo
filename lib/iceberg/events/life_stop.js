'use strict'

/**
 * Cancels any pending order submits prior to teardown
 *
 * Mapped to the `'life:stop'` event.
 *
 * @memberOf module:Iceberg
 * @param {object} instance - AO instance
 */
const onLifeStop = async (instance = {}) => {
  const { h = {} } = instance
  const { debouncedSubmitOrders } = h

  debouncedSubmitOrders.cancel()
}

module.exports = onLifeStop
