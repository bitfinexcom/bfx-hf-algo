/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const generateOrder = require('../../../../lib/accumulate_distribute/util/generate_order')

const getInstance = ({
  argParams = {}, stateParams = {}
}) => ({
  state: {
    args: {
      symbol: 'tBTCUSD',
      orderType: 'RELATIVE',
      relativeOffset: { type: 'mid', delta: 9.7 },
      relativeCap: { type: 'mid', delta: 9.7 },
      _margin: false,
      hidden: false,
      _futures: false,
      ...argParams
    },
    ...stateParams
  },

  h: {
    debug: () => {}
  }
})

describe('accumulate_distribute:util:generate_order', () => {
  it('checks if the generateOrder is a function', () => {
    assert.ok(_isFunction(generateOrder.gen))
  })

  it('calculates the relative price of an order correctly', () => {
    const i = getInstance({
      stateParams: {
        orderAmounts: [0.1, 0.1, 0.1],
        currentOrder: 0,
        lastBook: {
          midPrice: () => {
            return 10.6
          }
        },
        remainingAmount: 0.3
      }
    })
    const order = generateOrder.gen(i)
    assert.deepStrictEqual(order.price, 20.3, 'invalid relative price for the order')
  })
})
