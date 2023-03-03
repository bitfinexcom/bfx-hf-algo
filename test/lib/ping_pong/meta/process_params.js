/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('../../../../lib/ping_pong/meta/process_params')

describe('ping-pong:meta:process_params', () => {
  it('integrates supplied _symbol', () => {
    const params = processParams({ symbol: 'tETHUSD', _symbol: 'tBTCUSD' })
    assert.strictEqual(params.symbol, 'tBTCUSD')
  })

  it('check action and amount processing', () => {
    const buyParams = processParams({ amount: 1, action: 'buy' })
    const sellParams = processParams({
      amount: 1,
      action: 'sell',
      splitPingPongAmount: false
    })

    assert.strictEqual(buyParams.amount, 1)
    assert.strictEqual(buyParams.pingAmount, 1)
    assert.strictEqual(buyParams.pongAmount, 1)
    assert.strictEqual(buyParams.action, 'buy')

    assert.strictEqual(sellParams.amount, 1)
    assert.strictEqual(sellParams.pingAmount, -1)
    assert.strictEqual(sellParams.pongAmount, -1)
    assert.strictEqual(sellParams.action, 'sell')
  })
})
