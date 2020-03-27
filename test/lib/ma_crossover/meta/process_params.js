/* eslint-env mocha */
'use strict'

const assert = require('assert')
const processParams = require('../../../../lib/ma_crossover/meta/process_params')

describe('ma_crossover:meta:process_params', () => {
  it('sets up indicator args', () => {
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
})
