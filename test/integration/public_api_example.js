'use strict'

const Randomizer = require('../util/randomizer')
const { book: bookGenerator } = require('../util/mocks/data-providers')
const ApiMock = require('../util/mocks/bitfinex_api_mock')

const apiKey = 'api key'
const dataProvider = new Randomizer()
const args = {
  generators: {
    book: bookGenerator(dataProvider.fork(), [40857, 1, 48.28466138])
  }
}

const mock = new ApiMock(args)
mock.onSessionStarted((session) => {
  session.handleAuth((instance, event) => {
    return event.apiKey === apiKey
  })
})
