'use strict'

module.exports = (session) => {
  return ({ cid }) => {
    session.publish('pong', { cid })
  }
}
