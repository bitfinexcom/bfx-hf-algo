'use strict'

const FlakeId = require('flake-idgen')
const format = require('biguint-format')

let generator

module.exports = () => {
  if (!generator) {
    const {
      FLAKE_WORKER_ID: worker,
      FLAKE_DATACENTER_ID: datacenter
    } = process.env

    generator = new FlakeId({ worker, datacenter })
  }

  const id = generator.next()
  return format(id, 'dec')
}
