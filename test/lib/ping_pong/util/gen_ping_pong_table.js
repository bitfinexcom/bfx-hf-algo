/* eslint-env mocha */
'use strict'

const assert = require('assert')
const genPingPongTable = require('../../../../lib/ping_pong/util/gen_ping_pong_table')

describe('ping_pong:util:gen_ping_pong_table', () => {
  it('successfully generate ping/pong table, floats', () => {
    const args = {
      orderCount: 2,
      pongAmount: 0.3,
      pingPrice: 0.0006,
      pongPrice: 0.0007,
      pingMinPrice: 0.0004,
      pingMaxPrice: 0.0007,
      pongDistance: 0.0001
    }
    assert.ok(genPingPongTable(args, { '0.00040000': '0.00050000', '0.00070000': '0.00080000' }))
  })
})
