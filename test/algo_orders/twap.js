/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const { RESTv2, WSv2 } = require('bitfinex-api-node')
const { Order } = require('bitfinex-api-node/lib/models')
const { MockWSv2Server } = require('bfx-api-mock-srv')
const { TWAPOrder } = require('../../')

const API_KEY = 'dummy'
const API_SECRET = 'dummy'

const getMockWSv2 = (params = {}, wss) => {
  const ws = new WSv2(Object.assign({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    url: 'ws://localhost:9997'
  }, params))

  if (wss) {
    ws.once('close', () => wss.close())
  }

  return ws
}

const dummyWS2 = new WSv2()
const dummyREST2 = new RESTv2()
const getTestTWAPArgs = () => ({
  symbol: 'tBTCUSD',
  orderType: 'EXCHANGE LIMIT',
  priceTarget: TWAPOrder.PRICE_TARGET.OB_SIDE,
  tradeBeyondEnd: true,
  amount: 2,
  sliceAmount: 0.02,
  sliceInterval: 5000
})

const getTestTWAP = (extraArgs, ws = dummyWS2, rest = dummyREST2) => {
  return new TWAPOrder(
    ws,
    rest,
    Object.assign(getTestTWAPArgs(), extraArgs)
  )
}

describe('TWAP', () => {
  it.skip('constructor: validates arguments')

  it('constructor: sets initial remainingAmount', () => {
    const t = getTestTWAP()
    assert.equal(t.remainingAmount, t.amount)
  })

  it('start: rejects if a timeout is already scheduled', (done) => {
    const t = getTestTWAP()
    t._scheduleOrderTimeout()
    t.start().then(() => assert(false)).catch(() => {
      clearTimeout(t.timeoutID)
      done()
    })
  })

  it('start: rejects if the websocket is not connected', (done) => {
    const t = getTestTWAP()
    t.start().catch((err) => {
      assert(err.message.indexOf('ws') !== -1)
      done()
    })
  })

  it('start & stop schedule & clear the order timeout', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = getMockWSv2({}, wss)
    ws.open()
    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const t = getTestTWAP({}, ws)
      assert(!t.timeoutID)

      t.start().then(() => {
        assert(t.timeoutID)
        return t.stop()
      }).then(() => {
        assert(!t.timeoutID)
        ws.close()
        done()
      }).catch(done)
    })
  })

  it('_getOrderInterval: returns the correct order interval by creation ts', () => {
    const t = getTestTWAP()
    t.startTS = Date.now()

    const o = new Order({ mtsCreate: Date.now() + (51 * 1000) })
    assert.equal(t._getOrderInterval(o), 10)
    o.mtsCreate = Date.now()
    assert.equal(t._getOrderInterval(o), 0)
    o.mtsCreate = Date.now() + (10 * 1000) - 20
    assert.equal(t._getOrderInterval(o), 1)
    o.mtsCreate = Date.now() + (10 * 1000) + 20
    assert.equal(t._getOrderInterval(o), 2)
  })

  it('_getCurrentInterval: returns the current (Date.now) interval #', () => {
    const t = getTestTWAP()
    t.startTS = Date.now() - (51 * 1000)
    assert.equal(t._getCurrentInterval(), 10)
    t.startTS = Date.now()
    assert.equal(t._getCurrentInterval(), 0)
    t.startTS = Date.now() - (10 * 1000) + 20
    assert.equal(t._getCurrentInterval(), 1)
    t.startTS = Date.now() - (10 * 1000) - 20
    assert.equal(t._getCurrentInterval(), 2)
  })

  it('_hasOrderForCurrentInterval: true if an ao exists from the current interval', () => {
    const t = getTestTWAP()
    t.start = Date.now() - 100

    assert(!t._hasOrderForCurrentInterval())
    t.atomicOrders[0] = new Order({ mtsCreate: Date.now() })
    assert(t._hasOrderForCurrentInterval())
    delete t.atomicOrders[0]
    assert(!t._hasOrderForCurrentInterval())
  })

  it('_hasTrdePriceCondition: true if the price target is numeric w/ a trade price condition', () => {
    const t = getTestTWAP({
      priceTarget: 100,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_LAST
    })

    assert(t._hasTradePriceCondition())
    assert(!t._hasOBPriceCondition())
  })

  it('_hasOBPriceCondition: true if the price target is numeric w/ an OB condition', () => {
    const t = getTestTWAP({
      priceTarget: 100,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_MIDPOINT
    })

    assert(t._hasOBPriceCondition())
    assert(!t._hasTradePriceCondition())
  })

  it('_needsOrder: true if there are no unconfirmed or valid orders open', () => {
    const t = getTestTWAP()
    t.startTS = Date.now() - 100
    assert(t._needsOrder())
    t.unconfirmedOrderCIds.add(42)
    assert(!t._needsOrder())
    t.unconfirmedOrderCIds.delete(42)
    assert(t._needsOrder())
    t.atomicOrders[0] = new Order({ mtsCreate: Date.now() })
    assert(!t._needsOrder())
    t.atomicOrders[0].mtsCreate = Date.now() - 1000000
    assert(t._needsOrder())
  })

  it('_onMatchingTrade: updates locally cached last price', () => {
    const t = getTestTWAP()
    t._onMatchingTrade([[0, 0, 0, 200]])
    assert.equal(t.lastPrice, 200)
  })

  it('_onMatchingTrade: does nothing if no trade price condition', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.OB_MID })
    t._submitNextOrder = () => assert(false)
    t._onMatchingTrade([[0, 0, 0, 200]])
  })

  it('_onMatchingTrade: does nothing if no order is needed', () => {
    const t = getTestTWAP({
      priceTarget: 200,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_LAST
    })
    t.startTS = Date.now() - 100
    t.atomicOrders[0] = new Order({ mtsCreate: Date.now() })

    t._submitNextOrder = () => assert(false)
    t._onMatchingTrade([[0, 0, 0, 200]])
  })

  it('_onMatchingTrade: submits a new atomic order on last price match', (done) => {
    const t = getTestTWAP({
      priceTarget: 200,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_LAST
    })

    t.startTS = Date.now() - 100

    t._submitNextOrder = () => done()
    t._onMatchingTrade([[0, 0, 0, 200]])
  })

  it('_onMatchingOB: updates locally cached OB from snapshot', () => {
    const t = getTestTWAP()
    assert(!t.ob)
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
    assert(t.ob)
    assert.deepEqual(t.ob.getEntry(100), { price: 100, count: 1, amount: 1 })
    assert.deepEqual(t.ob.getEntry(200), { price: 200, count: 1, amount: -1 })
    t._onMatchingOB([[100, 2, 3]])
    assert.deepEqual(t.ob.getEntry(100), { price: 100, count: 2, amount: 3 })
    assert.deepEqual(t.ob.getEntry(200), null)
  })

  it('_onMatchingOB: does nothing if no ob price condition', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.LAST })
    t._submitNextOrder = () => assert(false)
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
  })

  it('_onMatchingOB: does nothing if no order is needed', () => {
    const t = getTestTWAP({
      priceTarget: 150,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_MIDPOINT
    })
    t.startTS = Date.now() - 100
    t.atomicOrders[0] = new Order({ mtsCreate: Date.now() })

    t._submitNextOrder = () => assert(false)
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
  })

  it('_onMatchingOB: submits a new atomic order on ob side match', (done) => {
    const t = getTestTWAP({
      priceTarget: 200,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_SIDE
    })

    t.startTS = Date.now() - 100
    t._submitNextOrder = () => done()
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
  })

  it('_onMatchingOB: submits a new atomic order on ob mid match', (done) => {
    const t = getTestTWAP({
      priceTarget: 150,
      priceCondition: TWAPOrder.PRICE_COND.MATCH_MIDPOINT
    })

    t.startTS = Date.now() - 100
    t._submitNextOrder = () => done()
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
  })

  it('_scheduleOrderTimeout: false if it is already scheduled', () => {
    const t = getTestTWAP()
    t.timeoutID = setTimeout(() => {}, 10000)
    assert(!t._scheduleOrderTimeout())
    clearTimeout(t.timeoutID)
  })

  it('_scheduleOrderTimeout: false if remaining amount is below min', () => {
    const t = getTestTWAP()
    t.remainingAmount = 0.005
    assert(!t._scheduleOrderTimeout())
  })

  it('_scheduleOrderTimeout: schedules timeout and returns true if conditions are met', (done) => {
    const t = getTestTWAP({
      sliceInterval: 250
    })

    t.startTS = Date.now()
    t._onTimeoutTriggered = () => {
      assert(Date.now() - t.startTS <= 260) // note the padding
      done()
    }

    assert(t._scheduleOrderTimeout())
  })

  it('_clearOrderTimeout: clears order timeout and sets it to null if it exists', (done) => {
    const t = getTestTWAP({
      sliceInterval: 70
    })

    t.startTS = Date.now()
    t._onTimeoutTriggered = () => assert(false)
    assert(t._scheduleOrderTimeout())
    t._clearOrderTimeout()
    assert.equal(t.timeoutID, null)

    setTimeout(() => {
      done()
    }, 100)
  })

  it('_getCurrentPrice: returns price target if it is numeric', () => {
    const t = getTestTWAP({ priceTarget: 100 })
    assert.equal(t._getCurrentPrice(), 100)
  })

  it('_getCurrentPrice: returns last price on condition', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.LAST })
    t.lastPrice = 42
    assert.equal(t._getCurrentPrice(), 42)
  })

  it('_getCurrentPrice: returns ob mid on condition', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.OB_MID })
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
    assert.equal(t._getCurrentPrice(), 150)
  })

  it('_getCurrentPrice: returns ob side on condition', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.OB_SIDE })
    t._onMatchingOB([[100, 1, 1], [200, 1, -1]])
    assert.equal(t._getCurrentPrice(), 200)
  })

  it('_getCurrentPrice: returns null for last price target w/ no data', () => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.LAST })
    assert.equal(t._getCurrentPrice(), null)
  })

  it('_getCurrentPrice: returns null for ob target w/ no data', () => {
    const tA = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.OB_SIDE })
    assert.equal(tA._getCurrentPrice(), null)
    const tB = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.OB_MID })
    assert.equal(tB._getCurrentPrice(), null)
  })

  it('_getCurrentPrice: returns null on unmatched price target', () => {
    const t = getTestTWAP()
    t.priceTarget = 'not a price target'
    assert.equal(t._getCurrentPrice(), null)
  })

  it('_onTimeoutTriggered: schedules next timeout', (done) => {
    const t = getTestTWAP({ priceTarget: TWAPOrder.PRICE_TARGET.LAST })
    assert(!t.timeoutID)
    t._onTimeoutTriggered().then(() => {
      assert(t.timeoutID)
      clearTimeout(t.timeoutID)
      done()
    }).catch(done)
  })

  it('_onTimeoutTriggered: submits next order for non-numeric targets', (done) => {
    const t = getTestTWAP({
      priceTarget: TWAPOrder.PRICE_TARGET.LAST
    })

    t.lastPrice = 100
    let submitCalled = false

    t._submitNextOrder = () => { submitCalled = true }
    t._onTimeoutTriggered().then(() => {
      assert(submitCalled)
      clearTimeout(t.timeoutID)
      done()
    }).catch(done)
  })

  it('_onTimeoutTriggered: cancels open orders if not trading beyond end', (done) => {
    const t = getTestTWAP()
    t.tradeBeyondEnd = false
    let cancelCalled = false
    t._cancelOpenOrders = () => { cancelCalled = true }
    t._onTimeoutTriggered().then(() => {
      assert(cancelCalled)
      clearTimeout(t.timeoutID)
      done()
    }).catch(done)
  })

  it('_submitNextOrder: stops & returns if remaining amount is below min', (done) => {
    const t = getTestTWAP()
    t._getNextSliceOrder = () => ({ price: 1, amount: 1 })
    t.remainingAmount = 0.005

    let sendCalled = false
    let stopCalled = false

    t.sendOrder = () => {
      sendCalled = true
      return Promise.resolve()
    }

    t.stop = () => {
      stopCalled = true
      return Promise.resolve()
    }

    t._submitNextOrder().then(() => {
      assert(!sendCalled)
      assert(stopCalled)
      done()
    })
  })

  it('_submitNextOrder: stops & returns if slice order is null', (done) => {
    const t = getTestTWAP()
    t._getNextSliceOrder = () => null

    let sendCalled = false
    let stopCalled = false

    t.sendOrder = () => {
      sendCalled = true
      return Promise.resolve()
    }

    t.stop = () => {
      stopCalled = true
      return Promise.resolve()
    }

    t._submitNextOrder().then(() => {
      assert(!sendCalled)
      assert(stopCalled)
      done()
    })
  })

  it('_submitNextOrder: schedules a new timeout & returns if price data is missing', (done) => {
    const t = getTestTWAP()
    t._getNextSliceOrder = () => ({ amount: 1, price: null })
    assert(!t.timeoutID)

    t._submitNextOrder().then(() => {
      assert(t.timeoutID)
      clearTimeout(t.timeoutID)
      done()
    })
  })

  it('_submitNextOrder: sends the next slice order', (done) => {
    const t = getTestTWAP()
    const o = { amount: 42, price: 100 }
    let submitCalled = false

    t._getNextSliceOrder = () => o
    t._sendOrder = (order) => {
      assert.deepEqual(order, o)
      submitCalled = true
      return Promise.resolve()
    }

    t._submitNextOrder().then(() => {
      assert(submitCalled)
      done()
    })
  })

  it('_getNextSliceOrder: uses current price', () => {
    const t = getTestTWAP()
    t._getCurrentPrice = () => 42
    const o = t._getNextSliceOrder()
    assert.equal(o.price, 42)
  })

  it('_getNextSliceOrder: sets gid, cid, symbol, amount, and order type', () => {
    const t = getTestTWAP()
    const o = t._getNextSliceOrder()

    assert.equal(o.symbol, t.symbol)
    assert.equal(o.amount, t.sliceAmount)
    assert.equal(o.type, t.orderType)
    assert.equal(o.gid, t.gid)
    assert(o.cid)
  })

  it('_getNextSliceOrder: passes order through modifier if applicable', () => {
    const t = getTestTWAP({ orderModifier: (order) => {
      order.price = 42
      return order
    }})

    t._getCurrentPrice = () => 100

    const o = t._getNextSliceOrder()
    assert.equal(o.price, 42)
  })

  it('_getNextSliceOrder: returns null if final order amount below min', () => {
    const t = getTestTWAP({ orderModifier: (order) => {
      order.amount = 0.005
      return order
    }})

    t._getCurrentPrice = () => 100

    const o = t._getNextSliceOrder()
    assert.equal(o, null)
  })

  it('_handleOrderFill: does nothing if last fill was 0', (done) => {
    const t = getTestTWAP()
    const o = new Order({ amount: 10, amountOrig: 10 })

    let initial = t.remainingAmount
    let emitedFill = false

    t.on('fill', () => { emitedFill = true })
    t._handleOrderFill(o).then(() => {
      assert(!emitedFill)
      assert.equal(t.remainingAmount, initial)
      done()
    }).catch(done)
  })

  it('_handleOrderFill: subtracts last fill from remaining amount', (done) => {
    const t = getTestTWAP()
    const o = new Order({ amount: 0.5, amountOrig: 1 })
    o._lastAmount = 0.7

    let initial = t.remainingAmount

    t._handleOrderFill(o).then(() => {
      assert.equal(t.remainingAmount, initial - 0.2)
      done()
    }).catch(done)
  })

  it('_handleOrderFill: emits fill event with order', (done) => {
    const t = getTestTWAP()
    const o = new Order({ amount: 0.5, amountOrig: 1 })
    o._lastAmount = 0.7

    let emitedFill = false

    t.on('fill', (order) => {
      assert.equal(order, o)
      emitedFill = true
    })

    t._handleOrderFill(o).then(() => {
      assert(emitedFill)
      done()
    }).catch(done)
  })

  it('_handleOrderFill: emits filled & stops if the remaining amount is below min', (done) => {
    const t = getTestTWAP()
    t.remainingAmount = 0.005
    const o = new Order({ amount: 0.5, amountOrig: 1 })
    o._lastAmount = 0.7

    let filled = false
    let stopped = false

    t.on('filled', () => { filled = true })
    t.stop = () => {
      stopped = true
      return Promise.resolve()
    }

    t._handleOrderFill(o).then(() => {
      assert(filled)
      assert(stopped)
      done()
    }).catch(done)
  })
})
