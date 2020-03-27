/* eslint-env mocha */
'use strict'

const assert = require('assert')
const assignChannel = require('../../../../lib/host/events/assign_channel')

describe('host:events:assign_channel', () => {
  it('adds the provided channel/filter combo to the specified instance\'s state', async () => {
    const channel = 'trades'
    const filter = { symbol: 'tBTCUSD' }
    const i = {
      state: { channels: [] }
    }

    await assignChannel({
      emit: async () => {},
      instances: { a: i }
    }, 'a', channel, filter)

    assert.deepStrictEqual(i.state.channels, [{
      channel,
      filter
    }])
  })
})
