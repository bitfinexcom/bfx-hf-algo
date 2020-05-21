'use strict'

/**
 * Cancels any pending order submits prior to teardown
 *
 * @memberof module:bfx-hf-algo/Iceberg
 * @listens module:bfx-hf-algo.AOHost~lifeStop
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 */
const onLifeStop = async (instance = {}) => {
  const { h = {} } = instance
  const { debouncedSubmitOrders } = h

  debouncedSubmitOrders.cancel()
}

module.exports = onLifeStop
