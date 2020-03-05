/* eslint-env mocha */
'use strict'

const assert = require('assert')
const updateState = require('../../../../lib/host/events/update_state')

describe('host:events:update_state', () => {
  it('patches state with the provided update packet', async () => {
    const host = {
      emit: async () => {},
      instances: {
        a: {
          state: { value: 0 }
        }
      }
    }

    await updateState(host, 'a', { value: 42 })
    assert.strictEqual(host.instances.a.state.value, 42)
  })
})
