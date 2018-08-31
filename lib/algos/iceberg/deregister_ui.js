'use strict'

const AlgoOrder = require('../../algo_order')
const IcebergOrder = require('./index')

module.exports = (rest) => {
  return AlgoOrder.deregisterUI(rest, IcebergOrder.name, IcebergOrder.ui)
}
