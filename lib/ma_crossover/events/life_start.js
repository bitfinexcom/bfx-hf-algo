'use strict'

const HFI = require('bfx-hf-indicators')

/**
 * Creates the long and short indicators and saves them on the instance state
 * to be used during execution.
 *
 * @memberOf module:MACrossver
 * @listens AOHost~lifeStart
 * @param {AOInstance} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStart = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { debug, updateState, sendPing, subscribeDataChannels, tracer } = h
  const { long, short } = args

  debug(
    'starting with long %s(%d) and short %s(%d)',
    long.type.toUpperCase(), long.args[0], short.type.toUpperCase(), short.args[0]
  )

  const { ts } = await sendPing(state)

  const typeL = long.type.toUpperCase() === 'MA' ? 'SMA' : long.type.toUpperCase()
  const typeS = short.type.toUpperCase() === 'MA' ? 'SMA' : short.type.toUpperCase()

  const LongIndicatorClass = HFI[typeL]
  const ShortIndicatorClass = HFI[typeS]

  const longIndicator = new LongIndicatorClass(long.args)
  const shortIndicator = new ShortIndicatorClass(short.args)

  await updateState(instance, { longIndicator, shortIndicator, ts })

  tracer.createSignal('start', null, { args })

  subscribeDataChannels(state)
    .catch(e => debug('failed to subscribe to data channels: %s', e.message))
}

module.exports = onLifeStart
