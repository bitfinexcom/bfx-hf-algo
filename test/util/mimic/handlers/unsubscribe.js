'use strict'

/**
 * @param {BitfinexSessionMock} session
 * @returns {(function({chanId: *}))}
 */
module.exports = (session) => {
  return ({ chanId }) => {
    session.closeChannel(chanId)
  }
}
