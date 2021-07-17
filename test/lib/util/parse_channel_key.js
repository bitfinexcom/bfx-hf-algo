/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const parseChannelKey = require('../../../lib/util/parse_channel_key')

describe('parseChannelKey', () => {
  describe('trading candles key', () => {
    it('should parse channel key', () => {
      const details = parseChannelKey('trade:1m:LEOUSD')
      expect(details).to.eql({
        type: 'trade',
        tf: '1m',
        symbol: 'LEOUSD'
      })
    })

    it('should be able to parse symbols with colons', () => {
      const details = parseChannelKey('trade:1m:tTESTBTC:TESTUSD')
      expect(details).to.eql({
        type: 'trade',
        tf: '1m',
        symbol: 'tTESTBTC:TESTUSD'
      })
    })
  })

  describe('funding candles key', () => {
    it('should parse channel key', () => {
      const details = parseChannelKey('trade:1m:LEOUSD:a30:p2:p30')
      expect(details).to.eql({
        type: 'trade',
        tf: '1m',
        symbol: 'LEOUSD',
        aggr: 'a30',
        end: 'p30',
        start: 'p2'
      })
    })

    it('should be able to parse symbols with colons', () => {
      const details = parseChannelKey('trade:1m:tTESTBTC:TESTUSD:a30:p2:p30')
      expect(details).to.eql({
        type: 'trade',
        tf: '1m',
        symbol: 'tTESTBTC:TESTUSD',
        aggr: 'a30',
        end: 'p30',
        start: 'p2'
      })
    })
  })
})
