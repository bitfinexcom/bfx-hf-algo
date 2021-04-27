/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const parseChannelKey = require('../../../lib/util/parse_channel_key')

describe('parseChannelKey', () => {
  it('should parse channel key', () => {
    const details = parseChannelKey('key:1m:LEOUSD')
    expect(details).to.eql({
      key: 'key',
      tf: '1m',
      symbol: 'LEOUSD'
    })
  })

  it('should be able to parse symbols with colons', () => {
    const details = parseChannelKey('key:1m:tTESTBTC:TESTUSD')
    expect(details).to.eql({
      key: 'key',
      tf: '1m',
      symbol: 'tTESTBTC:TESTUSD'
    })
  })
})
