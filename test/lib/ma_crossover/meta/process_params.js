/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('../../../../lib/ma_crossover/meta/process_params')

describe('ma_crossover:meta:process_params', () => {
  const params = processParams({
    longType: 'EMA',
    longEMAPrice: 'close',
    longEMATF: '1m',
    longEMAPeriod: 100,

    shortType: 'EMA',
    shortEMAPrice: 'close',
    shortEMATF: '1m',
    shortEMAPeriod: 20
  })

  it('sets up indicator args', () => {
    assert.deepStrictEqual(params.long, {
      type: 'ema',
      candlePrice: 'close',
      candleTimeFrame: '1m',
      args: [100]
    })

    assert.deepStrictEqual(params.short, {
      type: 'ema',
      candlePrice: 'close',
      candleTimeFrame: '1m',
      args: [20]
    })
  })
  it('check action and amount processing', () => {
    const buyParams = processParams({ ...params, amount: 1, action: 'buy' })
    const sellParams = processParams({ ...params, amount: 1, action: 'sell' })

    assert.strictEqual(buyParams.amount, 1)
    assert.strictEqual(sellParams.amount, -1)
    assert.strictEqual(buyParams.action, 'buy')
    assert.strictEqual(sellParams.action, 'sell')
  })
})
