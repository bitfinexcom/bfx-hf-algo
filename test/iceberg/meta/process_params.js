/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFinite = require('lodash/isFinite')
const processParams = require('../../../lib/iceberg/meta/process_params')

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

  it('provides defaults for cancel & submit delays', () => {
    const params = processParams()
    assert(_isFinite(params.cancelDelay))
    assert(_isFinite(params.submitDelay))
  })

  it('negates amount if selling', () => {
    const buyParams = processParams({ amount: 1 })
    const sellParams = processParams({ amount: 1, action: 'Sell' })

    assert.strictEqual(buyParams.amount, 1)
    assert.strictEqual(sellParams.amount, -1)
  })
})
