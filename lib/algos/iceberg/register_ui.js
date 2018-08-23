'use strict'

const AlgoOrder = require('../../algo_order')

module.exports = (rest) => {
  return AlgoOrder.registerUI(rest, IcebergOrder.name, IcebergOrder.ui)
}
