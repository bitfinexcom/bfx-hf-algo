/* eslint-env mocha */
'use strict'

const assert = require('assert')
const genOrderLabel = require('../../../../lib/accumulate_distribute/meta/gen_order_label')

describe('accumulate_distribute:meta:gen_order_label', () => {
  const state = {
    args: {
      orderType: 'LIMIT',
      amount: 42,
      limitPrice: 1,
      sliceAmount: 7,
      sliceInterval: 13
    }
  }

  it('includes basic information', () => {
    const str = genOrderLabel(state)
    assert.ok(/LIMIT/.test(str), 'type not included')
    assert.ok(str.indexOf('42') !== -1, 'amount not included')
    assert.ok(str.indexOf('1') !== -1, 'price not included')
    assert.ok(str.indexOf('7') !== -1, 'slice amount not included')
    assert.ok(str.indexOf('' + Math.floor(13 / 1000)) !== -1, 'slice interval not included')
  })

  it('includes offset and cap information if used', () => {
    const str = genOrderLabel({
      args: {
        ...state.args,
        orderType: null,
        relativeOffset: { type: 'ema' },
        relativeCap: { type: 'ma' }
      }
    })

    assert.ok(str.indexOf('Offset EMA') !== -1, 'relative offset type not included')
    assert.ok(str.indexOf('Cap MA') !== -1, 'relative cap type not included')
  })
})
