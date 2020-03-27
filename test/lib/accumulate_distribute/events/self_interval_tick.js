/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const assert = require('assert')
const { Order } = require('bfx-api-node-models')
const scheduleTick = require('../../../../lib/accumulate_distribute/util/schedule_tick')
const selfIntervalTick = require('../../../../lib/accumulate_distribute/events/self_interval_tick')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  state: {
    gid: 42,
    ordersBehind: 4,
    orderAmounts: [],
    currentOrder: 7,
    args: {
      awaitFill: false,
      cancelDelay: 100,
      ...argParams
    },
    ...stateParams
  },

  h: {
    debug: () => {},
    updateState: async () => {},
    notifyUI: async () => {},
    emitSelf: async () => {},
    emit: async () => {},
    ...helperParams
  },

  ...params
})

describe('accumulate_distribute:events:self_interval_tick', () => {
  it('schedules the next tick', async () => {
    const i = getInstance({})
    const stubbedScheduler = sinon.stub(scheduleTick, 'tick').resolves()

    await selfIntervalTick(i)
    assert.ok(stubbedScheduler.calledOnceWithExactly(i), 'tick not called')
    stubbedScheduler.restore()
  })

  it('updates state with the new orders-behind count', async () => {
    let sawStateUpdate = false
    const o = new Order({ status: 'ACTIVE', amount: 1 })
    const i = getInstance({
      stateParams: {
        orders: [o],
        orderAmounts: [1, 1, 1],
        ordersBehind: 4,
        currentOrder: 1
      },

      argParams: {
        awaitFill: true // should not cancel, see below
      },

      helperParams: {
        emit: async (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            assert.ok(false, 'should not have cancelled orders')
          }
        },

        updateState: async (instance, packet) => {
          assert.strictEqual(instance, i, 'received unexpected instance')
          assert.strictEqual(packet.ordersBehind, 2, 'orders behind incorrect')
          sawStateUpdate = true
        }
      }
    })

    const stubbedScheduler = sinon.stub(scheduleTick, 'tick').resolves()

    await selfIntervalTick(i)
    assert.ok(sawStateUpdate, 'did not see state update')

    stubbedScheduler.restore()
  })

  it('cancels all orders and re-submits if not awaiting fill', async () => {
    let sawCancel = false
    let sawSubmit = false

    const o = new Order({ status: 'ACTIVE', amount: 1 })
    const i = getInstance({
      stateParams: {
        orders: [o],
        orderAmounts: [1, 1, 1],
        ordersBehind: 4,
        currentOrder: 1
      },

      argParams: { awaitFill: false },
      helperParams: {
        emit: async (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            if (sawSubmit) {
              assert.ok(false, 'saw cancel after submit')
            }

            sawCancel = true
          }
        },

        emitSelf: async (eventName) => {
          if (eventName === 'submit_order') {
            sawSubmit = true
          }
        }
      }
    })

    const stubbedScheduler = sinon.stub(scheduleTick, 'tick').resolves()

    await selfIntervalTick(i)

    assert.ok(sawCancel, 'did not see order cancel event')
    assert.ok(sawSubmit, 'did not see order submit event')

    stubbedScheduler.restore()
  })
})
