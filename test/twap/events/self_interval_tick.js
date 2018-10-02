/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const _isObject = require('lodash/isObject')
const onIntervalTick = require('twap/events/self_interval_tick')
const Config = require('twap/config')

const args = {
  priceTarget: 1000,
  tradeBeyondEnd: true,
  cancelDelay: 100,
  submitDelay: 200,
  sliceAmount: 0.1,
  amount: 1,
  orderType: 'LIMIT'
}

describe('twap:events:self_interval_tick', () => {
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
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            if (eventName !== 'exec:order:cancel:all') {
              return
            }

            assert.equal(gid, 100)
            assert.deepEqual(orders, { o: 42 })
            assert.equal(delay, 100)
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
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            assert.equal(eventName, 'exec:order:submit:all')
            assert.equal(gid, 100)
            assert.equal(delay, 200)
            assert.equal(orders.length, 1)

            const [order] = orders
            assert(_isObject(order))
            assert.equal(order.price, args.priceTarget)
            assert.equal(order.amount, args.sliceAmount)
            assert.equal(order.type, 'LIMIT')
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
        debug: () => {},
        emit: (eventName, gid, orders, delay) => {
          return new Promise((resolve) => {
            assert.equal(eventName, 'exec:order:submit:all')
            assert.equal(gid, 100)
            assert.equal(delay, 200)
            assert.equal(orders.length, 1)

            const [order] = orders
            assert(_isObject(order))
            assert.equal(order.price, args.priceTarget)
            assert.equal(order.amount, args.sliceAmount)
            assert.equal(order.type, 'LIMIT')
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
