'use strict'

const BaseApiMock = require('../../util/base_api_mock')
const authHandler = require('../../util/mimic/handlers/auth')

function createApiMock () {
  const apiMock = new BaseApiMock({
    dataProviders: BaseApiMock.getDataProviders(),
    server: {
      port: process.env.MOCK_PORT
    },
    session: {
      eventHandlers: {
        auth: authHandler(() => true, 10)
      }
    }
  })

  return apiMock
}

if (process.argv[2] === 'spawn') {
  createApiMock()
  console.log('Mock API spawned')
}

module.exports = {
  createApiMock
}
