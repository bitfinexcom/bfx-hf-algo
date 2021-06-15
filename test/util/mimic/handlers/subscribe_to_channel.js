'use strict'

/**
 * @typedef {Object} SubscribeEvent
 * @property {string} channel
 * @property {string} [symbol]
 * @property {string} [key]
 */

/**
 * @param {Object} dataProviders
 * @returns {(function(BitfinexSessionMock): function(SubscribeEvent))|*}
 */
module.exports = (dataProviders) => (session) => (message) => {
  const { channel, ...fields } = message
  const dataProvider = dataProviders[channel]

  if (!dataProvider) {
    console.warn(`Could not find a data provider for ${channel} channel`)
    return
  }

  const chanId = session.createChannel()

  session.publish('subscribed', { ...fields, channel, chanId })

  session.each(100, (instance, stop, prevState) => {
    const state = dataProvider(fields, prevState)
    instance.streamTo(chanId, state)

    return state
  })
}
