'use strict'

const generator = require('./global_ids')

let next

module.exports = () => {
  if (!next) {
    const { MACHINE_ID: machineId = 0 } = process.env
    next = generator(machineId)
  }

  return next()
}
