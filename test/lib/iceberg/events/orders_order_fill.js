/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onOrderFill = require('../../../../lib/iceberg/events/orders_order_fill')

describe('iceberg:events:orders_order_fill', () => {
  const orderState = { 1: 'some_order_object' }
  const instance = {
    state: {
      gid: 100,
      orders: orderState,
      args: {
        amount: 100,
        cancelDelay: 42
      },
      remainingAmount: 100
    },

    h: {
      debug: () => {},
      updateState: async () => {},
      emitSelf: async () => {},
      emit: async () => {},
      debouncedSubmitOrders: () => {}
    }
  }

  const filledOrder = {
    resetFilledAmount: () => {},
    getLastFillAmount: () => {
      return 42
    }
  }

  it('cancels all known orders', (done) => {
    let called = 0

    onOrderFill({
      ...instance,
      h: {
        ...instance.h,
        emit: (eName, gid, orders, cancelDelay) => {
          if (called !== 0) return
          called += 1

          return new Promise((resolve) => {
            assert.strictEqual(gid, 100)
            assert.strictEqual(eName, 'exec:order:cancel:all')
            assert.strictEqual(cancelDelay, 42)
            assert.deepStrictEqual(orders, orderState)
            resolve()
          }).then(done).catch(done)
        }
      }
    }, filledOrder)
  })

  it('updates remaining amount w/ fill amount', (done) => {
    onOrderFill({
      ...instance,
      state: {
        ...instance.state,
        remainingAmount: 100
      },

      h: {
        ...instance.h,

        updateState: (inst, update) => {
          return new Promise((resolve) => {
            assert.deepStrictEqual(update, {
              remainingAmount: 58
            })
            resolve()
          }).then(done).catch(done)
        }
      }
    }, filledOrder)
  })

  it('updates remaining amount w/ fill amount, floats', (done) => {
    const filledOrderFloat = {
      resetFilledAmount: () => {},
      getLastFillAmount: () => {
        return 0.1
      }
    }

    onOrderFill({
      ...instance,
      state: {
        ...instance.state,
        remainingAmount: 0.3
      },

      h: {
        ...instance.h,

        updateState: (inst, update) => {
          return new Promise((resolve) => {
            assert.deepStrictEqual(update, {
              remainingAmount: 0.2
            })
            resolve()
          }).then(done).catch(done)
        }
      }
    }, filledOrderFloat)
  })

  it('submits orders if remaining amount is not dust', (done) => {
    onOrderFill({
      ...instance,
      state: {
        ...instance.state,
        remainingAmount: 100
      },

      h: {
        ...instance.h,

        debouncedSubmitOrders: () => {
          done()
        }
      }
    }, filledOrder)
  })

  const testStopAmount = (remainingAmount, done) => {
    onOrderFill({
      ...instance,
      state: {
        ...instance.state,
        remainingAmount
      },

      h: {
        ...instance.h,

        emitSelf: (eName) => {
          return new Promise((resolve) => {
            throw new Error('should not have submitted')
          }).then(done).catch(done)
        },

        emit: (eName) => {
          return new Promise((resolve) => {
            if (eName === 'exec:stop') {
              done()
            }
            resolve()
          }).catch(done)
        }
      }
    }, filledOrder)
  }

  it('emits stop event if dust is left', (done) => {
    testStopAmount(42.00000001, done)
  })

  it('emits stop event if no amount is left', (done) => {
    testStopAmount(42, done)
  })
})
