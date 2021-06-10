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
      submitOrder: async (state, o) => {},
      ...helperParams
    }
  })

  it('throws an error if called with an unrecognized AO', async () => {
    const host = {
      a: getInstance({ stateParams: { id: 'something-else' } })
    }

    try {
      await submitAllOrders(host, 'a', [])
      assert.ok(false)
    } catch (e) {
      assert.ok(true)
    }
  })

  it('provides a label with each order', (done) => {
    const o = new Order()
    const host = {
      emit: () => {},
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
            submitOrder: (_, o) => {
              assert.ok(_isString(o.meta.label) && !_isEmpty(o.meta.label))
              assert.strictEqual(o.meta.label, 'some-label')
              done()
            }
          }
        })
      }
    }

    submitAllOrders(host, 'a', [o])
  })

  it('sets the HF meta flag', (done) => {
    const o = new Order()
    const host = {
      emit: () => {},
      getAO: (type) => {
        assert.strictEqual(type, 'known-ao')
        return {}
      },

      instances: {
        a: getInstance({
          stateParams: { id: 'known-ao' },
          helperParams: {
            submitOrder: (_, o) => {
              assert.strictEqual(o.meta._HF, 1)
              done()
            }
          }
        })
      }
    }

    submitAllOrders(host, 'a', [o])
  })

  it('clear state on cancel', async () => {
    const o1 = new Order({ cid: 'test-cid1' })
    const o2 = new Order({ cid: 'test-cid2' })
    const instance = getInstance({
      stateParams: { id: 'known-ao' },
      helperParams: {
        submitOrder: (_, o, onCancel) => {
          if (o1 === o) {
            return onCancel()
          }
        }
      }
    })
    const host = {
      emit: () => {},
      getAO: (type) => {
        assert.strictEqual(type, 'known-ao')
        return {}
      },
      instances: {
        a: instance
      }
    }

    await submitAllOrders(host, 'a', [o1, o2])
    assert.deepStrictEqual(Object.keys(instance.state.orders), ['test-cid2'])
  })
})
