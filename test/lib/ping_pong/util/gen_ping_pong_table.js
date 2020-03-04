/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isFunction = require('lodash/isFunction')
const genPingPongTable = require('../../../../lib/ping_pong/util/gen_ping_pong_table')

// TODO: stub for coverage results
describe('ping_pong:util:gen_ping_pong_table', () => {
  assert.ok(_isFunction(genPingPongTable))
})
