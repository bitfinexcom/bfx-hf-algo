/* eslint-env mocha */
'use strict'

const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const assert = require('assert')
const Promise = require('bluebird')
const onDeclareChannels = require('triangular_arbitrage/meta/declare_channels')

chai.use(chaiAsPromised)
const expect = chai.expect;

describe('triangular_arbitrage:meta:onDeclareChannels', () => {
  it('declares orderbook channels if limit enabled', (done) => {
    const symbol1 = 'tBTCUSD'
    const symbol2 = 'tETHBTC'
    const symbol3 = 'tETHUSD'
    let counter = 0
    onDeclareChannels({
      h: {
        declareChannel: (instance, host, channel, data) => {
          return new Promise((resolve) => {
            let sym = data.symbol
            assert.strictEqual(channel, 'book')
            assert.strictEqual(sym === symbol1 || sym === symbol2 || sym === symbol3, true)
            counter += 1
            if (counter >= 3) {
              done()
            }
            console.log(channel, data)
            resolve()
          }).catch(done)
        }
      },
      state: {
        args: {
          symbol1,
          symbol2,
          symbol3,
          limit: true
        }
      }
    })
  })
  it('does not declare orderbook channels if limit not specified', async () => {
    await expect(onDeclareChannels({
      h: {
        declareChannel: (instance, host, channel, data) => {
          throw Error('Not supposed to be called')
        }
      },
      state: {
        args: {
          symbol1: 'tBTCUSD',
          symbol2: 'tETHBTC',
          symbol3: 'tETHUSD',
          limit: true
        }
      }
    })).to.eventually.be.rejectedWith(Error)
  })
})
