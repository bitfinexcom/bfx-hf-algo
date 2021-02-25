/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const _isObject = require('lodash/isObject')
const onIntervalTick = require('../../../../lib/twap/events/self_interval_tick')
const Config = require('../../../../lib/twap/config')

const args = {
  priceTarget: 1000,
  tradeBeyondEnd: true,
  cancelDelay: 100,
  submitDelay: 200,
  sliceAmount: 0.1,
  amount: 1,
  orderType: 'LIMIT'
}

const timeout = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('twap:events:self_interval_tick', () => {
  it('submits order for float order amount', async () => {
    let orderSubmitted = false
    const instance = {
      state: {
        gid: 100,
        orders: { o: { amount: 0.1 }, p: { amount: 0.1 } },
        args: {
          ...args,
          amount: 0.3,
          orderType: 'MARKET'
        }
      },
      h: {
        timeout,
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:order:submit:all') {
            orderSubmitted = true
          }
        }
      }
    }
    await onIntervalTick(instance)
    assert.ok(orderSubmitted, 'did not submit order for float amounts')
  })

  it('doesn\'t submit a new order if order amount exceeds in case of trading beyond end', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        orders: { o: { amount: 0.4 }, p: { amount: 0.4 } },
        args: {
          ...args,
          sliceAmount: 0.4
        }
      },

      h: {
        timeout,
        debug: (msg) => {
          if (msg === 'tick') {
            return
          }
          assert.strictEqual(msg, 'next tick would exceed total order amount, refusing')
          done()
        },
        emit: () => {}
      }
    })
  })

  it('cancels if not trading beyond end period and there are orders', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        orders: { o: 42 },
        args: {
          ...args,
          tradeBeyondEnd: false
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            if (eventName !== 'exec:order:cancel:all') {
              return
            }

            assert.strictEqual(gid, 100)
            assert.deepStrictEqual(orders, { o: 42 })
            assert.strictEqual(delay, 100)
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })

  it('does not submit orders if book price data needed & unavailable', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_MIDPOINT
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve, reject) => {
            reject(new Error('should not have submitted orders'))
          }).catch(done)
        }
      }
    })

    done()
  })

  it('does not submit orders if trade price data needed & unavailable', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_LAST
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve, reject) => {
            reject(new Error('should not have submitted orders'))
          }).catch(done)
        }
      }
    })

    done()
  })

  it('submits order if book price data needed, available, and matched', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        lastBook: {
          midPrice: () => { return 1000 }
        },

        remainingAmount: 1,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_MIDPOINT
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            assert.strictEqual(eventName, 'exec:order:submit:all')
            assert.strictEqual(gid, 100)
            assert.strictEqual(orders.length, 1)

            const [order] = orders
            assert(_isObject(order))
            assert.strictEqual(order.price, args.priceTarget)
            assert.strictEqual(order.amount, args.sliceAmount)
            assert.strictEqual(order.type, 'LIMIT')
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })

  it('submits order if trade price data needed, available, and matched', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        lastTrade: { price: 1000 },
        remainingAmount: 1,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_LAST
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            assert.strictEqual(eventName, 'exec:order:submit:all')
            assert.strictEqual(gid, 100)
            assert.strictEqual(orders.length, 1)

            const [order] = orders
            assert(_isObject(order))
            assert.strictEqual(order.price, args.priceTarget)
            assert.strictEqual(order.amount, args.sliceAmount)
            assert.strictEqual(order.type, 'LIMIT')
            resolve()
          }).then(done).catch(done)
        }
      }
    })
  })

  it('does not submit order if trade price data needed, available, but not matched', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        lastTrade: { price: 2000 },
        remainingAmount: 1,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_LAST
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve, reject) => {
            reject(new Error('should not have submitted orders'))
          }).catch(done)
        }
      }
    })

    done()
  })

  it('does not submit order if book price data needed, available, but not matched', (done) => {
    onIntervalTick({
      state: {
        gid: 100,
        lastBook: {
          midPrice: () => { return 2000 }
        },

        remainingAmount: 1,
        args: {
          ...args,
          priceCondition: Config.PRICE_COND.MATCH_MIDPOINT
        }
      },

      h: {
        timeout,
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve, reject) => {
            reject(new Error('should not have submitted orders'))
          }).catch(done)
        }
      }
    })

    done()
  })
})
