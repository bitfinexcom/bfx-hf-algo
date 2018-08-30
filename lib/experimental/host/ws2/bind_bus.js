'use strict'

const debug = require('debug')('bfx:hf:host:ws2:bind-bus')
const _isEmpty = require('lodash/isEmpty')
const processMessage = require('./process_message')

module.exports = (aoHost) => {
  const { m } = aoHost
  const messages = []
  let processing = false

  const enqueMessage = (type, ...args) => {
    debug('enqueue %s', type)

    messages.push({ type, args })

    if (!processing) {
      processMessages().catch((err) => {
        debug('error processing: %s', err.stack)
      })
    }
  }

  const processMessages = async () => {
    processing = true

    while (!_isEmpty(messages)) {
      const [ msg ] = messages.splice(0, 1)

      await processMessage(aoHost, msg)
    }

    processing = false
  }

  [
    'ws2:open',
    'ws2:event:auth:success',
    'ws2:event:auth:error',
    'ws2:auth:os',
    'ws2:auth:on',
    'ws2:auth:ou',
    'ws2:auth:oc',
    'ws2:data:trades',
    'ws2:data:book'
  ].forEach((msgType) => {
    m.on(msgType, (...args) => {
      enqueMessage(msgType, ...args)
    })
  })
}