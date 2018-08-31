'use strict'

const AlgoOrder = require('../../algo_order')
const IcebergOrder = require('./index')

module.exports = (rest) => {
  return AlgoOrder.registerUI(rest, IcebergOrder.name, IcebergOrder.ui)
}
