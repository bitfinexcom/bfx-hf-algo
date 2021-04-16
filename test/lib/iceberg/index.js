/* eslint-env mocha */
'use strict'

process.env.DEBUG = '*'

const Iceberg = require('../../../lib/iceberg')
const testAOLive = require('../../util/test_ao_live')

testAOLive({
  name: 'Iceberg',
  aoID: 'bfx-iceberg',
  aoClass: Iceberg,
  defaultParams: {
    symbol: 'tLEOUSD',
    price: 2,
    amount: -12,
    sliceAmount: -6,
    excessAsHidden: true,
    orderType: 'LIMIT',
    _margin: true
  },

  tests: [{
    description: 'submits initial orders on startup',
    execEarly: ({ harness, done }) => {
      harness.once('self:submit_orders', done)
    }
  }]
})
