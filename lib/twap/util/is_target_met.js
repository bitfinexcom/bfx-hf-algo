'use strict'

const _isFinite = require('lodash/isFinite')

module.exports = (args = {}, price) => {
  const { priceTarget, priceDelta } = args

  return _isFinite(priceDelta)
    ? price >= (priceTarget - priceDelta) && price <= (priceTarget + priceDelta)
    : price === priceTarget
}
