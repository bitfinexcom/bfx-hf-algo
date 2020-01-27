/* eslint-env mocha */
'use strict'

const { Order, OrderBook } = require('bfx-api-node-models')
const assert = require('assert')
const generateOrder = require('triangular_arbitrage/util/generate_order')
const { MARKET, BEST_BID, BEST_ASK } = require('triangular_arbitrage/util/constants')

const stateTemplate = {
  h: {
    debug: console.log
  },
  state: {
    lastBook: {
    },
    args: {
      symbol1: 'tBTCUSD',
      symbol2: 'tETHBTC',
      symbol3: 'tETHUSD',
      orderType1: BEST_BID,
      orderType2: BEST_BID,
      orderType3: BEST_ASK,
      amount: 2.3,
      orders: [
      ]
    }
  }
}

describe('triangular_arbitrage:meta:generate_order', () => {
  it('generates the correct starting order - BEST_BID', () => {
    let instance = Object.assign({}, stateTemplate)
    instance.state.lastBook['tBTCUSD'] = new OrderBook({
      bids: [
        // PRICE
        // COUNT
        // AMOUNT
        [100, 1, 0.8]
      ],
      asks: [
        [110, 3, 8.3]
      ]
    })
    instance.state.args.orderType1 = BEST_BID
    let order = generateOrder(instance, 'tBTCUSD')
    assert(order.symbol, 'tBTCUSD')
    assert(order.price, 100)
    assert(order.amount, 2.3)
    assert(order.type, 'EXCHANGE LIMIT')
  })

  it('generates the correct intermediate order - BEST_BID', () => {
    let instance = Object.assign({}, stateTemplate)
    instance.state.lastBook['tETHBTC'] = new OrderBook({
      bids: [
        // PRICE
        // COUNT
        // AMOUNT
        [0.019, 1, 0.8]
      ],
      asks: [
        [0.0191, 3, 8.3]
      ]
    })
    instance.orders = [
      new Order({ symbol: 'tBTCUSD', amountOrig: 2.3, priceAvg: 100 })
    ]
    instance.state.args.orderType2 = BEST_BID
    let order = generateOrder(instance, 'tETHBTC')
    assert(order.symbol, 'tETHBTC')
    assert(order.price, 0.001)
    assert(order.amount, 2.3 / 0.019)
    assert(order.type, 'EXCHANGE LIMIT')
  })

  it('generates the correct final order - BEST_ASK', () => {
    let instance = Object.assign({}, stateTemplate)
    instance.state.lastBook['tETHUSD'] = new OrderBook({
      bids: [
        // PRICE
        // COUNT
        // AMOUNT
        [168.64, 1, 0.8]
      ],
      asks: [
        [172.01, 3, 8.3]
      ]
    })
    instance.orders = [
      new Order({ symbol: 'tBTCUSD', amountOrig: 2.3, priceAvg: 100 }),
      new Order({ symbol: 'tETHBTC', amountOrig: 121.05, priceAvg: 0.019 })
      // new Order({ symbol: 'tETHUSD', amount: -90, price: 120 })
    ]
    instance.state.args.orderType3 = BEST_ASK
    let order = generateOrder(instance, 'tETHUSD')
    assert(order.symbol, 'tETHUSD')
    assert(order.amount, -(2.3 / 0.019))
    assert(order.price, 172.01)
    assert(order.type, 'EXCHANGE LIMIT')
  })

  it('generates the correct final order - MARKET', () => {
    let instance = Object.assign({}, stateTemplate)
    instance.orders = [
      new Order({ symbol: 'tBTCUSD', amountOrig: 2.3, priceAvg: 100 }),
      new Order({ symbol: 'tETHBTC', amountOrig: 121.05, priceAvg: 0.019 })
      // new Order({ symbol: 'tETHUSD', amount: -90, price: 120 })
    ]
    instance.state.args.orderType3 = MARKET
    let order = generateOrder(instance, 'tETHUSD')
    console.log(order)
    assert(order.symbol, 'tETHUSD')
    assert(order.amount, -(2.3 / 0.019))
    assert(order.type, 'EXCHANGE MARKET')
  })
})
