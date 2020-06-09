'use strict'

/**
 * Cancels any pending order submits prior to teardown
 *
 * @memberof module:bfx-hf-algo/Iceberg
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 */
const onLifeStop = async (instance = {}) => {
  const { h = {} } = instance
  const { debouncedSubmitOrders } = h

  debouncedSubmitOrders.cancel()
}

module.exports = onLifeStop
