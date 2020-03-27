/* eslint-env mocha */
'use strict'

const assert = require('assert')
const unserialize = require('../../../../lib/iceberg/meta/unserialize')

describe('iceberg:meta:unserialize', () => {
  it('includes relevant data from DB packet', () => {
    const data = {
      args: { amount: 42 },
      remainingAmount: 2,
      label: 'Iceberg 42 @ MARKET',
      name: 'Iceberg'
    }

    const loadedState = unserialize(data)

    assert.strictEqual(loadedState.remainingAmount, data.remainingAmount, 'remaining amount not equal')
    assert.strictEqual(loadedState.label, data.label, 'remaining amount not equal')
    assert.strictEqual(loadedState.name, data.name, 'name not equal')
    assert.deepStrictEqual(loadedState.args, data.args, 'args not equal')
  })
})
