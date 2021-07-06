/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const getRandomNumberInRange = require('../../../lib/util/get_random_number_in_range')

describe('util:get_random_number_in_range', () => {
  it('generates random number within the given number range', () => {
    const random = getRandomNumberInRange(1, 10)
    expect(random).to.be.within(1, 10)
  })

  it('generates random number within the given number range for negative numbers', () => {
    const random = getRandomNumberInRange(-1, -10)
    expect(random).to.be.within(-10, -1)
  })
})
