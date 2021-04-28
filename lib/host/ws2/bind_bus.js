'use strict'

const debug = require('debug')('bfx:hf:algo:ao-host:ws2:bind-bus')
const _isEmpty = require('lodash/isEmpty')
const processMessage = require('./process_message')

module.exports = (aoHost) => {
  const { adapter } = aoHost
  const messages = []
  let processing = false

  const enqueueMessage = (type, ...args) => {
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
      const [msg] = messages.splice(0, 1)

      await processMessage(aoHost, msg)
    }

    processing = false
  }

  [
    'open',
    'auth:success',
    'auth:error',
    'auth:n',
    'order:snapshot',
    'order:new',
    'order:update',
    'order:close',
    'order:error',
    'trades',
    'book'
  ].forEach((msgType) => {
    adapter.on(msgType, (...args) => {
      enqueueMessage(msgType, ...args)
    })
  })
}
