/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const assert = require('assert')
const _isObject = require('lodash/isObject')
const scheduleTick = require('../../../../lib/twap/util/schedule_tick')
const onIntervalTick = require('../../../../lib/twap/events/self_interval_tick')
const Config = require('../../../../lib/twap/config')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    gid: 100,
    isBookUpdated: true,
    remainingAmount: 1,
    orders: { o: { amount: 0.1 }, p: { amount: 0.1 } },
    args: {
      priceTarget: 1000,
      tradeBeyondEnd: true,
      cancelDelay: 100,
      submitDelay: 200,
      sliceAmount: 0.1,
      amount: 1,
      orderType: 'LIMIT',
      priceCondition: Config.PRICE_COND.MATCH_MIDPOINT,
      ...argParams
    },
    ...stateParams
  },
  h: {
    timeout: () => {
      return [null, () => {}]
    },
    debug: () => {},
    updateState: () => {},
    emitSelf: () => {},
    emit: () => {},
    ...helperParams
  },
  ...params
})

describe('twap:events:self_interval_tick', () => {
  it('calls schedule tick function when book isn\'t updated', async () => {
    const stubbedScheduler = sinon.stub(scheduleTick, 'tick').resolves()
    const instance = getInstance({
      stateParams: {
        isBookUpdated: false
      }
    })
    await onIntervalTick(instance)
    assert.ok(stubbedScheduler.calledOnceWithExactly(instance), 'schedule tick not called when book not updated')
  })

  it('submits order for float order amount', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      argParams: {
        amount: 0.3,
        orderType: 'MARKET'
      },
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.ok(orderSubmitted, 'did not submit order for float amounts')
  })

  it('doesn\'t submit a new order if order amount exceeds in case of trading beyond end', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      stateParams: {
        orders: { o: { amount: 0.1 }, p: { amount: 0.1 } },
        isBookUpdated: true
      },
      argParams: {
        sliceAmount: 0.4
      },
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.ok(!orderSubmitted, 'should not have submitted a new order if order amount exceeds')
  })

  it('cancels if not trading beyond end period and there are orders', async () => {
    const instance = getInstance({
      stateParams: {
        orders: { o: 42 }
      },
      argParams: {
        tradeBeyondEnd: false
      },
      helperParams: {
        emit: (eventName, gid, orders, delay) => {
          if (eventName !== 'exec:order:cancel:all') {
            return
          }
          assert.strictEqual(gid, 100)
          assert.deepStrictEqual(orders, { o: 42 })
        }
      }
    })
    await onIntervalTick(instance)
  })

  it('does not submit orders if book price data needed & unavailable', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.deepStrictEqual(orderSubmitted, false, 'should not have submitted orders')
  })

  it('does not submit orders if trade price data needed & unavailable', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      argParams: {
        priceCondition: Config.PRICE_COND.MATCH_LAST
      },
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.deepStrictEqual(orderSubmitted, false, 'should not have submitted orders')
  })

  it('submits order if book price data needed, available, and matched', async () => {
    const instance = getInstance({
      stateParams: {
        lastBook: {
          midPrice: () => { return 1000 }
        }
      },
      argParams: {
      },
      helperParams: {
        emit: (eventName, gid, orders) => {
          assert.strictEqual(eventName, 'exec:order:submit:all')
          assert.strictEqual(gid, 100)
          assert.strictEqual(orders.length, 1)

          const [order] = orders
          assert(_isObject(order))
          assert.strictEqual(order.price, 1000)
          assert.strictEqual(order.amount, 0.1)
          assert.strictEqual(order.type, 'LIMIT')
        }
      }
    })
    await onIntervalTick(instance)
  })

  it('submits order if trade price data needed, available, and matched', async () => {
    const instance = getInstance({
      stateParams: {
        lastTrade: { price: 1000 }
      },
      argParams: {
        priceCondition: Config.PRICE_COND.MATCH_LAST
      },
      helperParams: {
        emit: (eventName, gid, orders) => {
          assert.strictEqual(eventName, 'exec:order:submit:all')
          assert.strictEqual(gid, 100)
          assert.strictEqual(orders.length, 1)

          const [order] = orders
          assert(_isObject(order))
          assert.strictEqual(order.price, 1000)
          assert.strictEqual(order.amount, 0.1)
          assert.strictEqual(order.type, 'LIMIT')
        }
      }
    })
    await onIntervalTick(instance)
  })

  it('does not submit order if trade price data needed, available, but not matched', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      stateParams: {
        lastTrade: { price: 2000 }
      },
      argParams: {
        priceCondition: Config.PRICE_COND.MATCH_LAST
      },
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.deepStrictEqual(orderSubmitted, false, 'should not have submitted orders')
  })

  it('does not submit order if book price data needed, available, but not matched', async () => {
    let orderSubmitted = false
    const instance = getInstance({
      stateParams: {
        lastBook: {
          midPrice: () => { return 2000 }
        }
      },
      helperParams: {
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    })
    await onIntervalTick(instance)
    assert.deepStrictEqual(orderSubmitted, false, 'should not have submitted orders')
  })
})
