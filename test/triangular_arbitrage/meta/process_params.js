/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('triangular_arbitrage/meta/process_params')

describe('triangular_arbitrage:meta:processParams', () => {
  it('symbol1 + symbol2 + symbol3 are processed correctly during buy', () => {
    const params = processParams({
      _symbol: 'tBTCUSD',
      action: 'Buy',
      amount: '10',
      intermediateCcy: 'ETH'
    })
    assert.strictEqual(params.symbol1, 'BTCUSD')
    assert.strictEqual(params.symbol2, 'ETHBTC')
    assert.strictEqual(params.symbol3, 'ETHUSD')
  })

  it('symbol1 + symbol2 + symbol3 are processed correctly during sell', () => {
    const params = processParams({
      _symbol: 'tBTCUSD',
      action: 'Sell',
      amount: '10',
      intermediateCcy: 'ETH'
    })
    assert.strictEqual(params.symbol1, 'BTCUSD')
    assert.strictEqual(params.symbol2, 'ETHUSD')
    assert.strictEqual(params.symbol3, 'ETHBTC')
  })
})
