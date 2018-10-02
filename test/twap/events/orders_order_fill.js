/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Promise = require('bluebird')
const onOrderFill = require('twap/events/orders_order_fill')

describe('twap:events:orders_order_fill', () => {
  const orderState = { 1: 'some_order_object' }
  const instance = {
    state: {
      gid: 100,
      orders: orderState,
      args: {
        amount: 100,
        cancelDelay: 42
      }
    },

    h: {
      debug: () => {},
      updateState: async () => {},
      emitSelf: async () => {},
      emit: async () => {}
    }
  }

  const filledOrder = {
    getLastFillAmount: () => {
      return 42
    }
  }

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

  it('does not stop if remaining amount is not dust', (done) => {
    onOrderFill({
      ...instance,
      state: {
        ...instance.state,
        remainingAmount: 100
      },

      h: {
        ...instance.h,

        emit: (eName) => {
          return new Promise((resolve, reject) => {
            reject(new Error('should not have stopped'))
          }).catch(done)
        }
      }
    }, filledOrder)

    done()
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
