/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const { RESTv2, WSv2 } = require('bitfinex-api-node')
const { Order } = require('bitfinex-api-node/lib/models')
const { IcebergOrder } = require('../../')

const dummyWS2 = new WSv2()
const dummyREST2 = new RESTv2()
const getTestIcebergArgs = () => ({
  symbol: 'tBTCUSD',
  price: 1000,
  amount: 50,
  sliceAmount: 2,
  excessAsHidden: true,
  orderType: Order.type.EXCHANGE_LIMIT,
  submitDelay: 100,
  cancelDelay: 50
})

const getTestIceberg = (extraArgs) => {
  return new IcebergOrder(
    dummyWS2,
    dummyREST2,
    Object.assign(getTestIcebergArgs(), extraArgs)
  )
}

const getPartialFillOrder = () => {
  const o = new Order()
  o.amountOrig = 100
  o.amount = 50
  o._lastAmount = 55

  return o
}

describe('Iceberg', () => {
  it('constructor: throws on invalid price', () => {
    const args = getTestIcebergArgs()
    delete args.price
    assert.throws(() => new IcebergOrder(dummyWS2, dummyREST2, args))
    args.price = 0
    assert.throws(() => new IcebergOrder(dummyWS2, dummyREST2, args))
    args.price = -args.price
    assert.throws(() => new IcebergOrder(dummyWS2, dummyREST2, args))
  })

  it('constructor: throws on invalid volume', () => {
    const args = getTestIcebergArgs()
    delete args.amount
    assert.throws(() => new IcebergOrder(dummyWS2, dummyREST2, args))
  })

  it('constructor: throws on invalid slice volume', () => {
    const args = getTestIcebergArgs()
    delete args.sliceAmount
    assert.throws(() => new IcebergOrder(dummyWS2, dummyREST2, args))
  })

  it('constructor: defaults to \'iceberg\' algo name', () => {
    const args = getTestIcebergArgs()
    assert(new IcebergOrder(dummyWS2, dummyREST2, args).name === 'ao_iceberg')
  })

  it('_submitNextOrders: submits slice order if it exists', (done) => {
    const o = getTestIceberg()
    o._getSliceOrder = () => 'a'

    o._sendOrders = (orders) => {
      assert(orders.indexOf('a') !== -1)
      done()
    }

    o._submitNextOrders()
  })

  it('_submitNextOrders: submits excess order if enabled & it exists', (done) => {
    const oExcess = getTestIceberg({ excessAsHidden: true })
    const o = getTestIceberg({ excessAsHidden: false })

    o._getSliceOrder = () => 'a'
    o._getExcessOrder = () => 'b'
    oExcess._getSliceOrder = o._getSliceOrder
    oExcess._getExcessOrder = o._getExcessOrder

    oExcess._sendOrders = (orders) => {
      assert.equal(orders.length, 2)
      assert(orders.indexOf('a') !== -1)
      assert(orders.indexOf('b') !== -1)

      o._sendOrders = (orders) => {
        assert.equal(orders.length, 1)
        assert(orders.indexOf('a') !== -1)

        done()
      }

      o._submitNextOrders()
    }

    oExcess._submitNextOrders()
  })

  it('start: submits initial orders and resolves', (done) => {
    const o = getTestIceberg()
    let submitted = false

    o._submitNextOrders = () => {
      submitted = true
      return Promise.resolve(42)
    }

    o.start().then((res) => {
      assert.equal(res, 42)
      assert(submitted)
      done()
    }).catch(done)
  })

  it('_onOrderSnapshot: cancels snapshot orders', (done) => {
    const o = getTestIceberg()
    let sum = 0

    o._cancelOrder = (order) => {
      sum += +order.id
      if (sum === 42) done()
    }

    o._onOrderSnapshot([[12, 1, 1], [24, 2, 2], [6, 3, 3]])
  })

  it('_onOrderUpdate: updates atomic order', () => {
    const o = getTestIceberg()
    o.atomicOrders = { 1: new Order({ cid: 1 }) }
    const arr = ['a', o.gid, 1]
    arr[13] = '42'
    o._onOrderUpdate(arr)

    assert.equal(Object.keys(o.atomicOrders).length, 1)
    assert(o.atomicOrders[1])
    assert.equal(o.atomicOrders[1].status, '42')
  })

  it('_onOrderUpdate: calls through to _handleOrderFill for partial fills', (done) => {
    const o = getTestIceberg()

    o.atomicOrders = { 1: new Order({ cid: 1, amount: 50, amountOrig: 50 }) }
    const arr = ['a', o.gid, 1]
    arr[13] = ''

    o._handleOrderFill = () => assert(false)
    o._onOrderUpdate(arr)
    o._handleOrderFill = () => done()
    arr[13] = 'PARTIALLY FILLED'
    o._onOrderUpdate(arr)
  })

  it('_onOrderClose: removes atomic order', () => {
    const o = getTestIceberg()
    o.atomicOrders = { 1: new Order({ cid: 1 }) }
    const arr = ['a', o.gid, 1]
    arr[13] = 'CANCELED'
    o._onOrderClose(arr)
    assert.deepEqual(o.atomicOrders, {})
  })

  it('_onOrderClose: calls through to _handleOrderFill if not cancelled', (done) => {
    const oA = getTestIceberg()
    const oB = getTestIceberg()
    oA.atomicOrders = { 1: new Order({ cid: 1, amount: 50, amountOrig: 50 }) }
    oB.atomicOrders = { 1: new Order({ cid: 1, amount: 50, amountOrig: 50 }) }

    const arrA = [0, oA.gid, 1]
    const arrB = [0, oB.gid, 1]
    arrA[13] = 'CANCELED'
    arrB[13] = ''

    oA._handleOrderFill = () => assert(false)
    oB._handleOrderFill = () => done()

    oA._onOrderClose(arrA)
    oB._onOrderClose(arrB)
  })

  it('_handleOrderFill: does nothing if no fill occured', (done) => {
    const o = getTestIceberg()
    const ato = new Order({ amount: 1 })
    let fillCalled = false

    o.on('fill', () => { fillCalled = true })

    o._handleOrderFill(ato).then(() => {
      setTimeout(() => {
        assert(!fillCalled)
        done()
      }, 100)
    }).catch(done)
  })

  it('_handleOrderFill: emits fill event', (done) => {
    const o = getTestIceberg()
    o._isUpdateScheduled = () => true // don't send out orders
    const ato = getPartialFillOrder()

    o.on('fill', (order) => {
      assert.equal(order, ato)
      done()
    })

    o._isCancelScheduled = () => true
    o._handleOrderFill(ato)
  })

  it('_handleOrderFill: resolves immediately if mass cancel is scheduled', (done) => {
    const ato = getPartialFillOrder()
    const o = getTestIceberg()
    o._isCancelScheduled = () => true
    o._scheduleNextCancel = () => assert(false)

    o._handleOrderFill(ato).then(() => {
      done()
    }).catch(done)
  })

  it('_handleOrderFill: schedules a cancel if needed', (done) => {
    const ato = getPartialFillOrder()
    const o = getTestIceberg()

    o._isCancelScheduled = () => false
    o._scheduleNextCancel = () => Promise.reject(new Error('catch'))

    o._handleOrderFill(ato).then(() => {
      assert(false)
    }).catch((err) => {
      if (err && err.message === 'catch') return done()
      done(err)
    })
  })

  it('_scheduleNextSubmit: rejects if a submit is already scheduled', (done) => {
    const o = getTestIceberg()
    o._isSubmitScheduled = () => true
    o._scheduleNextSubmit().catch(() => done())
  })

  it('_scheduleNextSubmit: schedules & resolves on order submit', (done) => {
    const o = getTestIceberg()

    let ts = Date.now()
    o.submitDelay = 100
    o._submitNextOrders = () => {
      if (Date.now() - ts < 100) {
        return Promise.reject(new Error('submitted too early'))
      }

      return Promise.resolve(42)
    }

    o._scheduleNextSubmit().then((meaning) => {
      if (meaning === 42) done()
    }).catch(done)
  })

  it('_scheduleNextCancel: rejects if a cancel is already scheduled', (done) => {
    const o = getTestIceberg()
    o._isCancelScheduled = () => true
    o._scheduleNextCancel().then(() => assert(false)).catch(() => done())
  })

  it('_scheduleNextCancel: schedules & resolves on order cancel', (done) => {
    const o = getTestIceberg()

    let ts = Date.now()
    o.cancelDelay = 100
    o._cancelOpenOrders = () => {
      if (Date.now() - ts < 100) {
        return Promise.reject(new Error('cancelled too early'))
      }

      return Promise.resolve(42)
    }

    o._scheduleNextCancel().then((meaning) => {
      if (meaning === 42) done()
    }).catch(done)
  })

  it('_getSliceOrder: null if insufficient remaining volume', () => {
    const o = getTestIceberg()
    o.remainingAmount = 0
    assert.equal(o._getSliceOrder(), null)
  })

  it('_getSliceOrder: attaches gid to order', () => {
    const o = getTestIceberg({ gid: 42 })
    assert.equal(o._getSliceOrder().gid, 42)
  })

  it('_getSliceOrder: uses given price', () => {
    const o = getTestIceberg({ price: 42 })
    assert.equal(o._getSliceOrder().price, 42)
  })

  it('_getSliceOrder: uses given order type', () => {
    const o = getTestIceberg({ orderType: Order.type.FOK })
    assert.equal(o._getSliceOrder().type, Order.type.FOK)
  })

  it('_getSliceOrder: calculates correct amount', () => {
    const o = getTestIceberg()
    o.amount = 50
    o.sliceAmount = 2
    o.remainingAmount = 50
    assert.equal(o._getSliceOrder().amount, 2)
    o.amount = -50
    assert.equal(o._getSliceOrder().amount, -2)
    o.remainingAmount = 1
    assert.equal(o._getSliceOrder().amount, -1)
    o.amount = 50
    assert.equal(o._getSliceOrder().amount, 1)
    o.remainingAmount = 0
    assert.equal(o._getSliceOrder(), null)
  })

  it('_getSliceOrder: calls through to order modifier', () => {
    const o = getTestIceberg({ orderModifier: (o) => {
      o.price = 42
      o.amount = 42
      return o
    }})

    const so = o._getSliceOrder()

    assert.equal(so.price, 42)
    assert.equal(so.amount, 42)
  })

  it('_getSliceOrder: null if final volume below minimum', () => {
    const o = getTestIceberg({ orderModifier: (o) => {
      o.amount = 0.0001
      return o
    }})

    assert.equal(o._getSliceOrder(), null)
  })

  it('_getExcessOrder: null if insufficient remaining volume', () => {
    const o = getTestIceberg()
    o.remainingAmount = 0
    assert.equal(o._getExcessOrder(), null)
  })

  it('_getExcessOrder: attaches gid to order', () => {
    const o = getTestIceberg({ gid: 42 })
    assert.equal(o._getExcessOrder().gid, 42)
  })

  it('_getExcessOrder: uses given price', () => {
    const o = getTestIceberg({ price: 42 })
    assert.equal(o._getExcessOrder().price, 42)
  })

  it('_getExcessOrder: uses given order type', () => {
    const o = getTestIceberg({ orderType: Order.type.FOK })
    assert.equal(o._getExcessOrder().type, Order.type.FOK)
  })

  it('_getExcessOrder: calculates correct amount', () => {
    const o = getTestIceberg()
    o.amount = 50
    o.sliceAmount = 2
    o.remainingAmount = 50
    assert.equal(o._getExcessOrder().amount, 48)
    o.amount = -50
    assert.equal(o._getExcessOrder().amount, -48)
    o.remainingAmount = 1
    assert.equal(o._getExcessOrder(), null)
    o.amount = 50
    assert.equal(o._getExcessOrder(), null)
    o.remainingAmount = 10
    assert.equal(o._getExcessOrder().amount, 8)
    o.amount = -50
    assert.equal(o._getExcessOrder().amount, -8)
  })

  it('_getExcessOrder: calls through to order modifier', () => {
    const o = getTestIceberg({ orderModifier: (o) => {
      o.price = 42
      o.amount = 42
      return o
    }})

    const eo = o._getExcessOrder()

    assert.equal(eo.price, 42)
    assert.equal(eo.amount, 42)
  })

  it('_getExcessOrder: null if final volume below minimum', () => {
    const o = getTestIceberg({ orderModifier: (o) => {
      o.amount = 0.0001
      return o
    }})

    assert.equal(o._getExcessOrder(), null)
  })

  it('_getExcessOrder: marks order as hidden', () => {
    const o = getTestIceberg()
    assert(o._getExcessOrder().flags & Order.flags.HIDDEN)
  })
})
