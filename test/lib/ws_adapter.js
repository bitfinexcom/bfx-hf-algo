/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const proxyquire = require('proxyquire')
const { spy } = require('sinon')
const EventEmitter = require('events')

const manager = new EventEmitter()
let managerArgs
const Manager = spy((args) => {
  managerArgs = args
  return manager
})
const ManagedOB = spy(() => 'ManagedOB instance')
const ManagedCandles = spy(() => 'ManagedCandles instance')
const Watchdog = spy(() => 'Watchdog instance')

const WsAdapter = proxyquire('../../lib/ws_adapter', {
  'bfx-api-node-core': { Manager },
  'bfx-api-node-plugin-managed-ob': ManagedOB,
  'bfx-api-node-plugin-managed-candles': ManagedCandles,
  'bfx-api-node-plugin-wd': Watchdog
})

describe('WsAdapter', () => {
  describe('constructor', () => {
    const wsURL = 'ws url'
    const apiKey = 'api key'
    const apiSecret = 'api secret'
    const authToken = 'auth token'
    const agent = 'agent'
    const dms = 'dms'
    const withHeartbeat = true
    const affiliateCode = 'affiliate code'
    const plugin = 'external plugin instance'

    it('creates a new instance', () => {
      const adapter = new WsAdapter({
        wsURL, apiKey, apiSecret, authToken, agent, dms, withHeartbeat, affiliateCode, plugins: [plugin]
      })

      expect(adapter.affiliateCode).to.eq(affiliateCode)
      expect(adapter.hbEnabled).to.eq(withHeartbeat)
      expect(adapter.hbInterval).to.be.null
      expect(adapter.m).to.eq(manager)
      expect(Object.keys(manager._events)).to.eql([
        'ws2:error',
        'ws2:ticker',
        'ws2:trades',
        'ws2:candles',
        'ws2:book',
        'ws2:managed:book',
        'ws2:managed:candles',
        'ws2:notification',
        'ws2:message',
        'socket:updated',
        'ws2:event:info-server-restart',
        'ws2:reopen',
        'ws2:open',
        'ws2:event:auth:success',
        'ws2:event:auth:error',
        'ws2:auth:n',
        'ws2:auth:os',
        'ws2:auth:on',
        'ws2:auth:ou',
        'ws2:auth:oc',
        'ws2:data:trades',
        'ws2:data:book'
      ])
      expect(managerArgs).to.eql({
        plugins: [
          'external plugin instance',
          'ManagedOB instance',
          'ManagedCandles instance',
          'Watchdog instance'
        ],
        transform: true,
        dms,
        apiSecret,
        apiKey,
        authToken,
        agent,
        wsURL
      })
    })
  })
})
