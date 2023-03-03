/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('../../../../lib/twap/meta/process_params')

describe('twap:meta:process_params', () => {
  it('adds EXCHANGE prefix for non-margin and non-derivative order types', () => {
    const exchangeParams = processParams({ orderType: 'LIMIT', _margin: false })
    const marginParams = processParams({ orderType: 'LIMIT', _margin: true })
    const futureParams = processParams({ orderType: 'LIMIT', _futures: true })

    assert.strictEqual(exchangeParams.orderType, 'EXCHANGE LIMIT')
    assert.strictEqual(marginParams.orderType, 'LIMIT')
    assert.strictEqual(futureParams.orderType, 'LIMIT')
  })

  it('integrates supplied _symbol', () => {
    const params = processParams({ symbol: 'tETHUSD', _symbol: 'tBTCUSD' })
    assert.strictEqual(params.symbol, 'tBTCUSD')
  })

  it('negates amount if selling', () => {
    const buyParams = processParams({ amount: 1, action: 'buy' })
    const sellParams = processParams({ amount: 1, action: 'sell' })

    assert.strictEqual(buyParams.amount, 1)
    assert.strictEqual(sellParams.amount, -1)
    assert.strictEqual(buyParams.action, 'buy')
    assert.strictEqual(sellParams.action, 'sell')
  })

  it('integrates custom price target from price field', () => {
    const params = processParams({
      priceTarget: 'CUSTOM',
      price: 100
    })

    assert.strictEqual(params.priceTarget, 100)
  })

  it('converts slice interval from seconds to ms', () => {
    const params = processParams({ sliceInterval: 1 })
    assert.strictEqual(params.sliceInterval, 1000)
  })

  it('takes abs value of price delta if provided', () => {
    const params = processParams({ priceDelta: -1 })
    assert.strictEqual(params.priceDelta, 1)
  })
})
