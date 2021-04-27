/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const assert = require('assert')
const { Order } = require('bfx-api-node-models')
const generateOrder = require('../../../../lib/accumulate_distribute/util/generate_order')
const selfSubmitOrder = require('../../../../lib/accumulate_distribute/events/self_submit_order')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    gid: 42,
    args: {
      ...argParams
    },
    ...stateParams
  },

  h: {
    debug: () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:self_submit_order', () => {
  it('emits order-submit event with generated order', async () => {
    let sawSubmit = false
    const o = new Order({ price: 42, amount: 9001 })
    const stubbedOrderGen = sinon.stub(generateOrder, 'gen').returns(o)
    const i = getInstance({
      stateParams: { gid: 42 },
      helperParams: {
        emit: async (eventName, gid, orders) => {
          if (eventName !== 'exec:order:submit:all') {
            return
          }

          assert.strictEqual(gid, 42, 'invalid gid')
          assert.deepStrictEqual(orders, [o], 'invalid orders')
          sawSubmit = true
        }
      }
    })

    await selfSubmitOrder(i)
    assert.ok(sawSubmit, 'did not see order submit event')
    stubbedOrderGen.restore()
  })
})
