/* eslint-env mocha */
'use strict'

const assert = require('assert')
const serialize = require('../../../../lib/iceberg/meta/serialize')

describe('iceberg:meta:serialize', () => {
  it('includes relevant data on DB packet', () => {
    const data = {
      args: { amount: 42 },
      remainingAmount: 2,
      label: 'Iceberg 42 @ MARKET',
      name: 'Iceberg'
    }

    const dbPacket = serialize(data)

    assert.strictEqual(dbPacket.remainingAmount, data.remainingAmount, 'remaining amount not equal')
    assert.strictEqual(dbPacket.label, data.label, 'remaining amount not equal')
    assert.strictEqual(dbPacket.name, data.name, 'name not equal')
    assert.deepStrictEqual(dbPacket.args, data.args, 'args not equal')
  })
})
