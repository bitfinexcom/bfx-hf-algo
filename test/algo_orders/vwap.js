/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { WSv2, RESTv2 } = require('bitfinex-api-node')
const { VWAPOrder } = require('../../')

const dummyWS2 = new WSv2()
const dummyREST2 = new RESTv2()

const getTestVWAPArgs = () => ({
  symbol: 'tBTCUSD',
  orderType: 'EXCHANGE LIMIT',
  priceTarget: VWAPOrder.PRICE_TARGET.OB_SIDE,
  tradeBeyondEnd: true,
  amount: 2,
  sliceInterval: 5000,
  weights: [1, 1, 5, 1]
})

const getTestVWAP = (extraArgs, ws = dummyWS2, rest = dummyREST2) => {
  return new VWAPOrder(
    ws,
    rest,
    Object.assign(getTestVWAPArgs(), extraArgs)
  )
}

describe('VWAP', () => {
  it('constructor: throws on missing weights', () => {
    const args = getTestVWAPArgs()
    delete args.weights
    assert.throws(() => new VWAPOrder(dummyWS2, dummyREST2, args))
  })

  it('constructor: sets correct weight sum', () => {
    const vwap = getTestVWAP()
    assert.equal(vwap.weightSum, 8)
  })

  it('_getCurrentWeight: returns correct weight for interval', () => {
    const vwap = getTestVWAP()
    assert.equal(vwap._getCurrentWeight(), 1)
    vwap.startTS = Date.now() - 6000
    assert.equal(vwap._getCurrentWeight(), 1)
    vwap.startTS = Date.now() - 11000
    assert.equal(vwap._getCurrentWeight(), 5)
    vwap.startTS = Date.now() - 16000
    assert.equal(vwap._getCurrentWeight(), 1)
  })

  it('_getCurrentWeightFactor: returns correct value', () => {
    const vwap = getTestVWAP()
    assert.equal(vwap._getCurrentWeightFactor(), 0.125)
  })

  it('_getCurrentAmount: amounts over all weights add up to total', () => {
    const vwap = getTestVWAP()
    let totalAmount = 0

    totalAmount += vwap._getCurrentAmount()
    vwap.startTS = Date.now() - 6000
    totalAmount += vwap._getCurrentAmount()
    vwap.startTS = Date.now() - 11000
    totalAmount += vwap._getCurrentAmount()
    vwap.startTS = Date.now() - 16000
    totalAmount += vwap._getCurrentAmount()

    assert.equal(totalAmount, 2)
  })
})
