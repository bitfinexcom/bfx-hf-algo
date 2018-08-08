/* eslint-env mocha */
'use strict'

const assert = require('assert')
const WSv2 = require('bitfinex-api-node/lib/transports/ws2')
const RESTv2 = require('bitfinex-api-node/lib/transports/rest2')
const { MockWSv2Server } = require('bfx-api-mock-srv')
const { Order } = require('bitfinex-api-node/lib/models')
const { AlgoOrder } = require('../')

const testWS = new WSv2()
const testREST = new RESTv2()
const getTestOrder = (args = {}, ws = testWS, rest = testREST) => {
  const { channels } = args

  if (channels && ws) {
    channels.forEach(c => {
      if (c.chanId) {
        ws._channelMap[c.chanId] = c
      }
    })
  }

  return new AlgoOrder(ws, testREST, Object.assign({ symbol: 'tBTCUSD' }, args))
}

const createTestWSv2 = (params = {}, wss) => {
  const ws = new WSv2(Object.assign({
    apiKey: '',
    apiSecret: '',
    url: 'ws://localhost:9997'
  }, params))

  if (wss) {
    ws.once('close', () => wss.close())
  }

  return ws
}

describe('AlgoOrder', () => {
  before(() => {
    AlgoOrder.limits.ops = 10000
    AlgoOrder.limits.BTC = {
      total: { nValue: 30000, amount: 100 },
      algo: { nValue: 10000, amount: 10 }
    }

    AlgoOrder.limits.USD = {
      total: { nValue: 100000, amount: 100000 },
      algo: { nValue: 10000, amount: 10000 }
    }

    AlgoOrder.limits.ETH = {
      total: { nValue: 100000, amount: 100 },
      algo: { nValue: 25000, amount: 25 }
    }
  })

  it('constructor: throws error if a symbol is not provided', () => {
    assert.throws(() => {
      const o = new AlgoOrder(testWS)
      assert(!o.symbol)
    })
  })

  it('constructor: throws error if a ws2 client is not provided', () => {
    assert.throws(() => {
      const o = new AlgoOrder(null, { symbol: 'tBTCUSD' })
      assert(!o._ws)
    })
  })

  it('start: rejects if already running', (done) => {
    const ao = getTestOrder()
    ao.active = true
    ao.start().catch(() => done())
  })

  it('start: subscribes to ws2 channels', (done) => {
    const ao = getTestOrder()
    let subCalled = false
    ao._subChannels = () => { subCalled = true }
    ao.start().then(() => {
      assert(subCalled)

      return ao.stop().then(() => done())
    }).catch(done)
  })

  it('start: updates active flag', (done) => {
    const ao = getTestOrder()
    ao.active = false
    ao.start().then(() => {
      assert(ao.active)
      return ao.stop().then(() => done())
    }).catch(done)
  })

  it('stop: rejects if not running', (done) => {
    const ao = getTestOrder()
    ao.active = false
    ao.stop().catch(() => done())
  })

  it('stop: cancels open orders before resolving, if authenticated', (done) => {
    const ao = getTestOrder()
    ao.active = true
    let cancelCalled = false

    ao._cancelOpenOrders = () => {
      cancelCalled = true
      return Promise.resolve()
    }

    ao.ws._isAuthenticated = true

    ao.stop().then(() => {
      assert(cancelCalled)
      ao.ws._isAuthenticated = false
      done()
    }).catch(done)
  })

  it('stop: unsubscribes from ws2 channels', (done) => {
    const ao = getTestOrder()
    ao.active = true
    let unsubCalled = false
    ao._unsubChannels = () => { unsubCalled = true }
    ao.stop().then(() => {
      assert(unsubCalled)
      done()
    }).catch(done)
  })

  it('stop: updates active flag', (done) => {
    const ao = getTestOrder()
    ao.active = true
    ao.stop().then(() => {
      assert(!ao.active)
      done()
    }).catch(done)
  })

  it('_subChannels: subs to all order event channels', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      let seen = { os: false, on: false, ou: false, oc: false }

      const genListener = (eventName) => {
        return () => {
          seen[eventName] = true
          if (seen.os && seen.on && seen.ou && seen.oc) {
            wss.close()
            done()
          }
        }
      }

      ao._onOrderSnapshot = genListener('os')
      ao._onOrderNew = genListener('on')
      ao._onOrderUpdate = genListener('ou')
      ao._onOrderClose = genListener('oc')
      ao._subChannels()

      wss.send([0, 'os', [[100, ao.gid, 0, 'tBTCUSD']]])
      wss.send([0, 'on', [100, ao.gid, 0, 'tBTCUSD']])
      wss.send([0, 'ou', [100, ao.gid, 0, 'tBTCUSD']])
      wss.send([0, 'oc', [100, ao.gid, 0, 'tBTCUSD']])
    })

    ws.open()
  })

  it('_subChannels: subs to extra requested channels', (done) => {
    const ws = createTestWSv2()
    const ao = getTestOrder({
      channels: [{ channel: 'anything', symbol: 'tBTCUSD', payload: 42 }]
    }, ws)

    ws.managedSubscribe = (channel, identifier, data) => {
      assert.equal(channel, 'anything')
      assert.equal(identifier, 'tBTCUSD')
      assert.deepEqual(data, {
        channel: 'anything',
        symbol: 'tBTCUSD',
        payload: 42
      })

      done()
    }

    ao._subChannels()
  })

  it('_unsubChannels: unsubs from tracked channels')
  it('_unsubChannels: removes all listeners from ws2')

  it('_onMatchingTrade: called when ws2 receives a matching trade event', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2({}, wss)
    const d = err => ws.close() && done(err)

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({
        channels: [{ chanId: 1, channel: 'trades', pair: 'BTCUSD' }]
      }, ws)

      ao._onMatchingTrade = (trade) => {
        assert.deepEqual(trade, [['BTCUSD', 42]])
        ao.stop().then(() => d()).catch(d)
      }

      ao.start().then(() => {
        setTimeout(() => {
          wss.send([1, ['BTCUSD', 42]])
        }, 100)
      })
    })

    ws.open()
  })

  it('_onMatchingOB: called when ws2 receives a matching OB event', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2({}, wss)
    const d = err => ws.close() && done(err)

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({
        channels: [{ chanId: 1, channel: 'book', symbol: 'tBTCUSD' }]
      }, ws)

      ao._onMatchingOB = (entry) => {
        assert.deepEqual(entry, [[100, 1, 10]])
        ao.stop().then(() => d()).catch(d)
      }

      ao.start().then(() => {
        setTimeout(() => {
          wss.send([1, [[100, 1, 10]]])
        }, 100)
      })
    })

    ws.open()
  })

  it('_onOrderSnapshot: called when ws2 receives an order snapshot', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const oA = [0, ao.gid, 0, 'tBTCUSD']
      const oB = [1, ao.gid, 1, 'tBTCUSD']

      ao._onOrderSnapshot = (orders) => {
        assert.deepEqual(orders[0], oA)
        assert.deepEqual(orders[1], oB)
        ao._unsubChannels()
        wss.close()
        done()
      }

      ao._subChannels()
      wss.send([0, 'os', [oA, oB]])
    })

    ws.open()
  })

  it('_onOrderSnapshot: adds all orders to internal atomics map', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const oA = [0, ao.gid, 0, 'tBTCUSD']
      const oB = [1, ao.gid, 1, 'tBTCUSD']
      ao._subChannels()
      wss.send([0, 'os', [oA, oB]])

      setTimeout(() => {
        assert.deepEqual(Object.keys(ao.atomicOrders).sort(), ['0', '1'])
        assert.deepEqual(ao.atomicOrders[0].id, 0)
        assert.deepEqual(ao.atomicOrders[0].gid, ao.gid)
        assert.deepEqual(ao.atomicOrders[0].cid, 0)
        assert.deepEqual(ao.atomicOrders[1].id, 1)
        assert.deepEqual(ao.atomicOrders[1].gid, ao.gid)
        assert.deepEqual(ao.atomicOrders[1].cid, 1)

        Object.values(ao.atomicOrders).forEach(ao => ao.removeListeners())

        ao._unsubChannels()
        wss.close()
        done()
      }, 10)
    })

    ws.open()
  })

  it('_onOrderNew: called when ws2 receives a new order', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const o = [0, ao.gid, 0, 'tBTCUSD']

      ao._onOrderNew = (order) => {
        assert.deepEqual(order, o)
        ao._unsubChannels()
        wss.close()
        done()
      }

      ao._subChannels()
      wss.send([0, 'on', o])
    })

    ws.open()
  })

  it('_onOrderNew: adds order to atomics map', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const o = [0, ao.gid, 42, 'tBTCUSD']
      ao._subChannels()
      wss.send([0, 'on', o])

      setTimeout(() => {
        assert(ao.atomicOrders[42])
        assert.equal(ao.atomicOrders[42].id, 0)
        assert.equal(ao.atomicOrders[42].gid, ao.gid)
        assert.equal(ao.atomicOrders[42].cid, 42)
        assert.equal(ao.atomicOrders[42].symbol, 'tBTCUSD')

        ao._unsubChannels()
        wss.close()
        done()
      }, 10)
    })

    ws.open()
  })

  it('_onOrderUpdate: called when ws2 receives an order update', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const o = [0, ao.gid, 0, 'tBTCUSD']

      ao._onOrderUpdate = (order) => {
        assert.deepEqual(order, o)
        ao._unsubChannels()
        wss.close()
        done()
      }

      ao._subChannels()
      wss.send([0, 'ou', o])
    })

    ws.open()
  })

  it('_onOrderUpdate: updates order in atomics map', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      ao.atomicOrders = { 42: new Order({ id: 0, gid: ao.gid, cid: 42, price: 1 }) }

      const o = [0, ao.gid, 42, 'tBTCUSD']
      o[16] = 256
      ao._subChannels()
      wss.send([0, 'ou', o])

      setTimeout(() => {
        assert(ao.atomicOrders[42])
        assert.equal(ao.atomicOrders[42].price, 256)

        ao._unsubChannels()
        wss.close()
        done()
      }, 10)
    })

    ws.open()
  })

  it('_onOrderClose: called when ws2 receives an order close', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      const o = [0, ao.gid, 0, 'tBTCUSD']

      ao._onOrderClose = (order) => {
        assert.deepEqual(order, o)
        ao._unsubChannels()
        wss.close()
        done()
      }

      ao._subChannels()
      wss.send([0, 'oc', o])
    })

    ws.open()
  })

  it('_onOrderClose: removes order from atomics map', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({}, ws)
      ao.atomicOrders = { 0: new Order({ id: 0, gid: ao.gid, cid: 0 }) }
      const o = [0, ao.gid, 0, 'tBTCUSD']

      ao._subChannels()
      wss.send([0, 'oc', o])

      setTimeout(() => {
        assert.equal(Object.keys(ao.atomicOrders).length, 0)
        ao._unsubChannels()
        wss.close()
        done()
      }, 10)
    })

    ws.open()
  })

  it('_hasUnconfirmedOrders: true if ws2 promises are pending', () => {
    const ao = getTestOrder()
    assert(!ao._hasUnconfirmedOrders())
    ao.unconfirmedOrderCIds.add(42)
    assert(ao._hasUnconfirmedOrders())
  })

  it('_isUnconfirmedCId: true if there is a pending promise w/ this cid', () => {
    const ao = getTestOrder()
    ao.unconfirmedOrderCIds.add(256)
    assert(ao._isUnconfirmedCId(256))
    assert(!ao._isUnconfirmedCId(512))
  })

  it('_sendOrder: adds cid to unconfirmed list when order is sent, removes on resolve', (done) => {
    const wss = new MockWSv2Server({ listen: true })
    const ws = createTestWSv2()

    ws.once('open', ws.auth.bind(ws))
    ws.once('auth', () => {
      const ao = getTestOrder({ gid: 42 }, ws)
      const o = new Order({ symbol: '', gid: 42, cid: 0 })

      ao._sendOrder(o).then(() => {
        assert(!ao._isUnconfirmedCId(o.cid))
        wss.close()
        done()
      }).catch(done)

      assert(ao._isUnconfirmedCId(o.cid))
    })

    ws.open()
  })

  it('_genOrder: attaches gid', () => {
    const ao = getTestOrder({ gid: 42 })
    const o = ao._genOrder()
    assert.equal(o.gid, 42)
  })

  it('_genOrder: creates cid', () => {
    const ao = getTestOrder()
    const o = ao._genOrder()
    assert(o.cid)
    assert(!isNaN(o.cid))
  })

  it('_genOrder: attaches symbol', () => {
    const ao = getTestOrder({ symbol: 'tBTCUSD' })
    const o = ao._genOrder()
    assert.equal(o.symbol, 'tBTCUSD')
  })

  it('_finalizeOrder: passes params through order modifier if it exists', () => {
    const ao = getTestOrder({
      orderModifier: (o) => {
        o.meaning = 42
        return o
      }
    })

    const o = ao._finalizeOrder({ a: 1, b: 2 })
    assert.deepEqual(o, { a: 1, b: 2, meaning: 42 })
  })

  it('_finalizeOrder: returns order as-is if no modifier exists', () => {
    const ao = getTestOrder()
    const ref = { a: 1, b: 2 }
    const o = ao._finalizeOrder(ref)
    assert.deepEqual(ref, o)
  })

  it('getActiveNotionalValue: returns correct value', () => {
    const ao = getTestOrder()

    ao.atomicOrders = {
      1: new Order({ cid: 1, price: 100, amount: 10 }),
      2: new Order({ cid: 2, price: 100, amount: 20 }),
      3: new Order({ cid: 3, price: 100, amount: 30 })
    }

    assert.equal(ao.getActiveNotionalValue(), 6000)
  })

  it('getActiveAmount: returns correct value', () => {
    const ao = getTestOrder()

    ao.atomicOrders = {
      1: new Order({ cid: 1, price: 100, amount: 10 }),
      2: new Order({ cid: 2, price: 100, amount: 20 }),
      3: new Order({ cid: 3, price: 100, amount: 30 })
    }

    assert.equal(ao.getActiveAmount(), 60)
  })

  it('AlgoOrder.getOrdersByBaseCurrency: returns correct orders', (done) => {
    const aoUSD = getTestOrder({ cid: 42, symbol: 'tBTCUSD' })
    const aoBTC = getTestOrder({ cid: 43, symbol: 'tETHBTC' })

    Promise.all([aoUSD.start(), aoBTC.start()]).then(() => {
      assert.deepEqual(AlgoOrder.getOrdersByBaseCurrency('USD')[aoUSD])
      assert.deepEqual(AlgoOrder.getOrdersByBaseCurrency('BTC')[aoBTC])

      return Promise.all([aoUSD.stop(), aoBTC.stop()])
    }).then(() => done()).catch(done)
  })

  it('AlgoOrder.getActiveNotionalValue: returns correct value', (done) => {
    const aoUSD = getTestOrder({ cid: 42, symbol: 'tBTCUSD' })
    const aoBTC = getTestOrder({ cid: 45, symbol: 'tETHBTC' })

    aoUSD.atomicOrders = {
      1: new Order({ cid: 1, price: 2, amount: 5 }),
      2: new Order({ cid: 2, price: 2, amount: 5 })
    }

    aoBTC.atomicOrders = {
      3: new Order({ cid: 3, price: 2, amount: 10 }),
      4: new Order({ cid: 4, price: 2, amount: 10 })
    }

    assert.equal(AlgoOrder.getActiveNotionalValue('USD'), 0)
    assert.equal(AlgoOrder.getActiveNotionalValue('BTC'), 0)

    Promise.all([aoUSD.start(), aoBTC.start()]).then(() => {
      assert.equal(AlgoOrder.getActiveNotionalValue('USD'), 20)
      assert.equal(AlgoOrder.getActiveNotionalValue('BTC'), 40)
      return Promise.all([aoUSD.stop(), aoBTC.stop()])
    }).then(() => done()).catch(done)
  })

  it('AlgoOrder.getActiveAmount: returns correct value', (done) => {
    const aoUSD = getTestOrder({ cid: 42, symbol: 'tBTCUSD' })
    const aoBTC = getTestOrder({ cid: 45, symbol: 'tETHBTC' })

    aoUSD.atomicOrders = {
      1: new Order({ price: 2, amount: 5 }),
      2: new Order({ price: 2, amount: 5 })
    }

    aoBTC.atomicOrders = {
      1: new Order({ price: 2, amount: 10 }),
      2: new Order({ price: 2, amount: 10 })
    }

    Promise.all([aoUSD.start(), aoBTC.start()]).then(() => {
      assert.equal(AlgoOrder.getActiveAmount('BTC'), 10)
      assert.equal(AlgoOrder.getActiveAmount('ETH'), 20)
      return Promise.all([aoUSD.stop(), aoBTC.stop()])
    }).then(() => done()).catch(done)
  })

  it('_orderWithinLimits: returns error if over order nv limit', () => {
    const o = []
    o[3] = 'tBTCUSD'
    o[16] = 10
    o[6] = 2

    const ao = getTestOrder()

    assert.equal(ao._orderWithinLimits(o), null)
    o[16] = 7000
    assert(ao._orderWithinLimits(o) !== null)
  })

  it('_orderWithinLimits: returns error if over order amount limit', () => {
    const o = []
    o[3] = 'tBTCUSD'
    o[16] = 1
    o[6] = 2

    const ao = getTestOrder()

    assert.equal(ao._orderWithinLimits(o), null)
    o[6] = 20
    assert(ao._orderWithinLimits(o) !== null)
  })

  it('_orderWithinLimits: returns error if over global nv limit', () => {
    const o = []
    o[3] = 'tETHBTC'
    o[16] = 1000
    o[6] = 30

    const ao = getTestOrder()

    AlgoOrder.limits.BTC.algo.nValue = 10000000
    AlgoOrder.limits.ETH.algo.amount = 50

    assert.equal(ao._orderWithinLimits(o), null)
    o[6] = 31
    assert(ao._orderWithinLimits(o) !== null)

    AlgoOrder.limits.BTC.algo.nValue = 10000
    AlgoOrder.limits.ETH.algo.amount = 25
  })

  it('_orderWithinLimits: returns error if over global amount limit', () => {
    const o = []
    o[3] = 'tETHBTC'
    o[16] = 1
    o[6] = 10

    const ao = getTestOrder()

    assert.equal(ao._orderWithinLimits(o), null)
    o[6] = 1000
    assert(ao._orderWithinLimits(o) !== null)
  })

  it('_sendOrder: rejects with an error if the order would exceed a limit', (done) => {
    const o = []
    o[3] = 'tETHBTC'
    o[16] = 1
    o[6] = 1000

    const ao = getTestOrder()

    ao._sendOrder(o).catch(() => {
      done()
    })
  })

  it('_trackOPS: updates order limit interval', (done) => {
    const ao = getTestOrder()
    assert(!ao._opsTS)
    assert(!ao._opsCount)

    ao._trackOPS()

    assert.equal(ao._opsCount, 1)
    assert(Date.now() - ao._opsTS < 10)

    const ts = ao._opsTS
    ao._trackOPS()
    assert.equal(ao._opsCount, 2)
    assert.equal(ao._opsTS, ts)
    ao._trackOPS()
    assert.equal(ao._opsCount, 3)
    assert.equal(ao._opsTS, ts)

    setTimeout(() => {
      ao._trackOPS()
      assert.equal(ao._opsCount, 1)
      assert(Date.now() - ao._opsTS < 10)
      done()
    }, 1050)
  })

  it('_exceedsOPS: true if triggering an order now would exceed the OPS limit', (done) => {
    const ao = getTestOrder()

    AlgoOrder.limits.ops = 3
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(ao._exceedsOPS())

    setTimeout(() => {
      assert(!ao._exceedsOPS())
      done()
    }, 1050)
  })

  it('_exceedsOPS: false if no limit', () => {
    const ao = getTestOrder()

    delete AlgoOrder.limits.ops
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    ao._trackOPS()
    assert(!ao._exceedsOPS())
    AlgoOrder.limits.ops = 3
  })

  it('correctly updates limits', (done) => {
    const aoA = getTestOrder({ symbol: 'tBTCUSD' })
    aoA.atomicOrders = {
      1: new Order({ cid: 1, price: 1000, amount: 2 }),
      2: new Order({ cid: 2, price: 1000, amount: 5 })
    }

    const aoB = getTestOrder({ symbol: 'tBTCUSD' })
    aoB.atomicOrders = {
      3: new Order({ cid: 3, price: 2000, amount: 3 }),
      4: new Order({ cid: 4, price: 2000, amount: 3 })
    }

    const o = []
    o[3] = 'tBTCUSD'
    o[16] = 1
    o[6] = 1

    assert.equal(aoA._orderWithinLimits(o), null)

    o[6] = 5 // exceed algo BTC amount limit
    assert(aoA._orderWithinLimits(o) !== null)

    // increase global active nv/amount
    aoB.start().then(() => {
      // exceed global BTC amount limit
      AlgoOrder.limits.BTC.algo.amount = 500
      o[6] = 94
      assert.equal(aoA._orderWithinLimits(o), null)
      o[6] = 95
      assert(aoA._orderWithinLimits(o) !== null)

      return aoB.stop()
    }).then(() => {
      assert.equal(aoA._orderWithinLimits(o), null)
      AlgoOrder.limits.BTC.algo.amount = 10
      done()
    }).catch(() => {
      done(false)
    })
  })
})
