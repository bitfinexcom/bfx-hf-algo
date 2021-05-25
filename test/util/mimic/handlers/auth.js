'use strict'

/**
 * @typedef {Object} AuthEvent
 * @property {number} dms
 * @property {number} calc
 * @property {string} apiKey
 * @property {string} authSig
 * @property {string} authPayload
 * @property {number} authNonce
 */

/**
 * @param {function(AuthEvent): boolean} fn
 * @returns {function(BitfinexSessionMock): function(AuthEvent)}
 */
module.exports = (fn) => (session) => (event) => {
  const isAuthorized = fn(event)

  if (!isAuthorized) {
    session.publish('auth', {
      status: 'FAILED',
      chanId: 0,
      code: 0,
      msg: 'rejected'
    })
    return
  }

  session.publish('auth', {
    status: 'OK',
    chanId: 0,
    usedId: 1,
    dms: 4,
    auth_id: 'auth id',
    caps: {}
  })

  session.after(1000, () => session.sendSnapshots())
}
