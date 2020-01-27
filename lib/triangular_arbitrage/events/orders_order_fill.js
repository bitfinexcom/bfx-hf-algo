'use strict'

const trySubmitOrder = require('../util/try_submit_order')

module.exports = async (instance = {}, order) => {
  trySubmitOrder(instance)
}
