/* eslint-env mocha */
'use strict'

const assert = require('assert')
const withAOUpdate = require('../../../lib/host/with_ao_update')

describe('host:with_ao_update', () => {
  it('emits the persist event if a state delta is returned by the cb', async () => {
    const host = {
      instances: { a: { state: { test: 0 } } },
      emit: async (eventName, gid) => {
        assert.strictEqual(eventName, 'ao:persist')
        assert.strictEqual(gid, 'a')
      }
    }

    await withAOUpdate(host, 'a', async () => ({
      test: 9001
    }))

    assert.strictEqual(host.instances.a.state.test, 9001)
  })
})
