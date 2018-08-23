'use strict'

const AlgoOrder = require('../../algo_order')

module.exports = (rest) => {
  return AlgoOrder.deregisterUI(rest, IcebergOrder.name, IcebergOrder.ui)
}
