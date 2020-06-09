'use strict'

const HFI = require('bfx-hf-indicators')

/**
 * Creates the long and short indicators and saves them on the instance state
 * to be used during execution.
 *
 * @memberof module:bfx-hf-algo/MACrossver
 * @listens AOHost~lifeStart
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { debug, updateState } = h
  const { long, short } = args

  debug(
    'starting with long %s(%d) and short %s(%d)',
    long.type.toUpperCase, long.args[0], short.type.toUpperCase(), short.args[0]
  )

  const LongIndicatorClass = HFI[long.type.toUpperCase()]
  const ShortIndicatorClass = HFI[short.type.toUpperCase()]

  const longIndicator = new LongIndicatorClass(long.args)
  const shortIndicator = new ShortIndicatorClass(long.args)

  await updateState(instance, { longIndicator, shortIndicator })
}

module.exports = onLifeStart
