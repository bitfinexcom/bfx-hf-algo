/* eslint-env mocha */
'use strict'

const { Order } = require('bfx-api-node-models')
const assert = require('assert')
const genOrderLabel = require('triangular_arbitrage/meta/gen_order_label')

describe('triangular_arbitrage:meta:genOrderLabel', () => {
  it('declares orderbook channels if limit enabled', () => {
    const label = genOrderLabel({
      args: {
        symbol1: 'tBTCUSD',
        symbol2: 'tETHBTC',
        symbol3: 'tETHUSD',
        orders: [
          new Order({ symbol: 'tBTCUSD', amount: 100, price: 100 }),
          new Order({ symbol: 'tETHBTC', amount: 120, price: 90 }),
          new Order({ symbol: 'tETHUSD', amount: -90, price: 120 })
        ],
        limit: true
      }
    })
    assert.strictEqual(typeof label, 'string')
    assert.strictEqual(label.length > 0, true)
  })
})
