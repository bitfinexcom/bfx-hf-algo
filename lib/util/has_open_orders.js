'use strict'

module.exports = (orders = {}) => {
  return !!Object.values(orders).find((order = {}) => {
    const { status } = order

    return !status || (
      !status.match(/CANCELED/) && !status.match(/EXECUTED/)
    )
  })
}
