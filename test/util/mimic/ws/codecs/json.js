'use strict'

/**
 * @type {Codec}
 */
const codec = {
  encode: (msg) => JSON.stringify(msg),
  decode: (msg) => JSON.parse(msg)
}

module.exports = codec
