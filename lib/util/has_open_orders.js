'use strict'

module.exports = (orders = {}) => {
  return !!Object.values(orders).find((order = {}) => {
    const { status } = order

    return status === null || (
      !status.match(/CANCELED/) && !status.match(/EXECUTED/)
    )
  })
}
