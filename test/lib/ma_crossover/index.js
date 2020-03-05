/* eslint-env mocha */
'use strict'

process.env.DEBUG = '*'

const _last = require('lodash/last')
const testAOLive = require('../../util/test_ao_live')
const MACrossover = require('../../../lib/ma_crossover')

testAOLive({
  name: 'MA Crossover',
  aoID: 'bfx-ma_crossover',
  aoClass: MACrossover,
  defaultParams: {
    _symbol: 'tLEOUSD',
    orderType: 'LIMIT',
    orderPrice: 2,
    amount: 6,

    submitDelay: 0,
    cancelDelay: 0,

    longType: 'EMA',
    longEMAPrice: 'close',
    longEMATF: '1m',
    longEMAPeriod: 100,

    shortType: 'EMA',
    shortEMAPrice: 'close',
    shortEMATF: '1m',
    shortEMAPeriod: 20,

    action: 'Sell',
    _margin: true,
    _futures: false
  },

  tests: [{
    description: 'submits order when long/short indicators cross',
    exec: ({ instance, harness, done }) => {
      harness.once('internal:data:managedCandles', (candles, meta) => {
        instance.state.shortIndicator.crossed = () => true

        harness.once('self:submit_order', done)
        harness.trigger('data', 'managedCandles', [_last(candles)], meta)
      })
    }
  }]
})
