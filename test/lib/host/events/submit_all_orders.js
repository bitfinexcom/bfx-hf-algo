/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')
const { Order } = require('bfx-api-node-models')
const submitAllOrders = require('../../../../lib/host/events/submit_all_orders')

describe('host:events:submit_all_orders', () => {
  const getInstance = ({ stateParams = {}, helperParams = {} }) => ({
    state: {
      channels: [],
      orders: [],
      cancelledOrders: [],
      ...stateParams
    },

    h: {
      debug: () => {},
      submitOrderWithDelay: async (state, delay, o) => {},
      ...helperParams
    }
  })

  it('throws an error if called with an unrecognized AO', async () => {
    const host = {
      a: getInstance({ stateParams: { id: 'something-else' } })
    }

    try {
      await submitAllOrders(host, 'a', [], 100)
      assert.ok(false)
    } catch (e) {
      assert.ok(true)
    }
  })

  it('provides a label with each order', (done) => {
    const o = new Order()
    const host = {
      getAO: (type) => {
        assert.strictEqual(type, 'known-ao')
        return {
          meta: {
            genOrderLabel: () => 'some-label'
          }
        }
      },

      instances: {
        a: getInstance({
          stateParams: { id: 'known-ao' },
          helperParams: {
            submitOrderWithDelay: (_, delay, o) => {
              assert.strictEqual(delay, 100)
              assert.ok(_isString(o.meta.label) && !_isEmpty(o.meta.label))
              assert.strictEqual(o.meta.label, 'some-label')
              done()
            }
          }
        })
      }
    }

    submitAllOrders(host, 'a', [o], 100)
  })

  it('sets the HF meta flag', (done) => {
    const o = new Order()
    const host = {
      getAO: (type) => {
        assert.strictEqual(type, 'known-ao')
        return {}
      },

      instances: {
        a: getInstance({
          stateParams: { id: 'known-ao' },
          helperParams: {
            submitOrderWithDelay: (_, delay, o) => {
              assert.strictEqual(delay, 100)
              assert.strictEqual(o.meta._HF, 1)
              done()
            }
          }
        })
      }
    }

    submitAllOrders(host, 'a', [o], 100)
  })
})
