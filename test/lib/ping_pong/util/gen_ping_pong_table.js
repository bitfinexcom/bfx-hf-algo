/* eslint-env mocha */
'use strict'

const assert = require('assert')
const genPingPongTable = require('../../../../lib/ping_pong/util/gen_ping_pong_table')
const { getPings, getPongs, extract } = require('../../../../lib/ping_pong/util/ping_pong_table')

const args = {
  pingPrice: 0,
  pongPrice: 0,
  pongDistance: 0.8,
  pingMinPrice: 5.6,
  pingMaxPrice: 11.5,
  pingAmount: 2,
  pongAmount: 2,
  orderCount: 4
}

describe('ping_pong:util:gen_ping_pong_table', () => {
  it('generates ping pong table with correct prices', () => {
    const pingPongTable = genPingPongTable(args)
    assert.deepStrictEqual(getPings(pingPongTable).length, args.orderCount, 'invalid ping pong table')
    assert.deepStrictEqual(getPings(pingPongTable), ['5.6000', '7.5667', '9.5333', '11.500'], 'does not generate correct ping prices')
    assert.deepStrictEqual(getPongs(pingPongTable), ['6.4000', '8.3667', '10.333', '12.300'], 'does not generate correct pong prices')
  })

  it('generates the ping and pong price same as user input when orderCount is 1', () => {
    const singleOrderCountArgs = {
      ...args,
      pingPrice: 50000,
      pongPrice: 50500,
      orderCount: 1
    }
    const pingPongTable = genPingPongTable(singleOrderCountArgs)
    const [price] = extract(pingPongTable, '50000')
    assert.deepStrictEqual(getPings(pingPongTable).length, 1, 'invalid ping pong table')
    assert.deepStrictEqual(price, '50500', 'does not generate correct ping and pong prices')
  })
})
