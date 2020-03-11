'use strict'

/**
 * Stub to conform to the algo order schema.
 *
 * @memberOf module:OCOCO
 * @listens AOHost~lifeStop
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {}

module.exports = onLifeStop
