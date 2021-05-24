/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _includes = require('lodash/includes')
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
    console.log(str)
    assert.ok(/LIMIT/.test(str), 'type not included')
    assert.ok(_includes(str, '42'), 'amount not included')
    assert.ok(_includes(str, '1'), 'price not included')
    assert.ok(_includes(str, '7'), 'slice amount not included')
    assert.ok(_includes(str, '' + Math.floor(13 / 1000)) !== -1, 'slice interval not included')
  })

  it('includes offset and cap information if used', () => {
    const str = genOrderLabel({
      args: {
        ...state.args,
        orderType: null,
        relativeOffset: { type: 'ema' },
        relativeCap: { type: 'sma' }
      }
    })

    assert.ok(_includes(str, 'Offset EMA'), 'relative offset type not included')
    assert.ok(_includes(str, 'Cap SMA'), 'relative cap type not included')
  })
})
