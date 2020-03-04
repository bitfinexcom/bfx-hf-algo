/* eslint-env mocha */
'use strict'

const assert = require('assert')
const declareEvents = require('../../../../lib/accumulate_distribute/meta/declare_events')

const getInstance = ({
  params = {}, argParams = {}, stateParams = {}, helperParams = {}
}) => ({
  h: {
    declareEvent: async () => {},
    ...helperParams
  },
  ...params
})

describe('accumulate_distribute:meta:declare_events', () => {
  it('declares the self:submit_order event', async () => {
    let sawEventDecl = false
    const i = getInstance({
      helperParams: {
        declareEvent: async (instance, host, path, name) => {
          if (name === 'submit_order') {
            assert.strictEqual(instance, i, 'unknown instance')
            assert.strictEqual(host, 42, 'unknown host')
            assert.strictEqual(path, 'self:submit_order', 'unknown event path')
            sawEventDecl = true
          }
        }
      }
    })

    await declareEvents(i, 42)
    assert.ok(sawEventDecl, 'did not see event declaration')
  })

  it('declares the self:interval_tick event', async () => {
    let sawEventDecl = false
    const i = getInstance({
      helperParams: {
        declareEvent: async (instance, host, path, name) => {
          if (name === 'interval_tick') {
            assert.strictEqual(instance, i, 'unknown instance')
            assert.strictEqual(host, 42, 'unknown host')
            assert.strictEqual(path, 'self:interval_tick', 'unknown event path')
            sawEventDecl = true
          }
        }
      }
    })

    await declareEvents(i, 42)
    assert.ok(sawEventDecl, 'did not see event declaration')
  })
})
