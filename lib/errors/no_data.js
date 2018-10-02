'use strict'

class NoDataError extends Error {
  constructor (message, extra) {
    super()

    Error.captureStackTrace(this, this.constructor)

    this.name = 'NoDataError'
    this.message = message || ''

    if (extra) this.extra = extra
  }
}

module.exports = NoDataError
