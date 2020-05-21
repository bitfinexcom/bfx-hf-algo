'use strict'

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:MACrossover
 * @listens module:bfx-hf-algo.AOHost~lifeStop
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {}

module.exports = onLifeStop
