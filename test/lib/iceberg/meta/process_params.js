/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('../../../../lib/iceberg/meta/process_params')

describe('iceberg:meta:process_params', () => {
  it('adds EXCHANGE prefix for non-margin order types', () => {
    const exchangeParams = processParams({ orderType: 'LIMIT', _margin: false })
    const marginParams = processParams({ orderType: 'LIMIT', _margin: true })

    assert.strictEqual(exchangeParams.orderType, 'EXCHANGE LIMIT')
    assert.strictEqual(marginParams.orderType, 'LIMIT')
  })

  it('integrates supplied _symbol', () => {
    const params = processParams({ symbol: 'tETHUSD', _symbol: 'tBTCUSD' })
    assert.strictEqual(params.symbol, 'tBTCUSD')
  })

  it('negates amount if selling', () => {
    const buyParams = processParams({ amount: 1 })
    const sellParams = processParams({ amount: 1, action: 'Sell' })

    assert.strictEqual(buyParams.amount, 1)
    assert.strictEqual(sellParams.amount, -1)
  })

  it('converts slice amount from percent to abs value', () => {
    const params = processParams({
      amount: 3,
      sliceAmountPerc: 0.2
    })

    assert.strictEqual(params.sliceAmount, 0.6)
  })
})
