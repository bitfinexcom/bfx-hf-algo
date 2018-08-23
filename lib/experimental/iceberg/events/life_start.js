'use strict'

module.exports = async (state = {}, h = {}) => {
  const { emitSelf } = h
  emitSelf('submitOrders')
}
