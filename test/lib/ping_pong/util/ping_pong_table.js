/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { append, extract } = require('../../../../lib/ping_pong/util/ping_pong_table')

function getInitialPingPongTable () {
  let pingPongTable = []

  pingPongTable = append(pingPongTable, '50000', '50500')
  pingPongTable = append(pingPongTable, '60000', '60500')
  pingPongTable = append(pingPongTable, '70000', '70500')

  return pingPongTable
}

describe('ping_pong:util:ping_pong_table', () => {
  it('extract', () => {
    const pingPongTable = getInitialPingPongTable()

    const [price1, next1] = extract(pingPongTable, '50000')
    assert.strictEqual(price1, '50500')
    assert.deepStrictEqual(next1, [['60000', '60500'], ['70000', '70500']])
    const [price2, next2] = extract(pingPongTable, '60000')
    assert.deepStrictEqual(price2, '60500')
    assert.deepStrictEqual(next2, [['50000', '50500'], ['70000', '70500']])
  })
})
