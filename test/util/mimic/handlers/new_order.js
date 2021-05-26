'use strict'

const { Order } = require('bfx-api-node-models')

const { NEW_ORDER_REQUEST } = require('../signal_types')

/**
 * @typedef {Object} NewOrderDetails
 * @property [number] gid Group id for the order
 * @property {number} cid Should be unique in the day (UTC) (not enforced)
 * @property {string} type The type of the order: LIMIT, EXCHANGE LIMIT, MARKET, EXCHANGE MARKET, STOP, EXCHANGE STOP, STOP LIMIT, EXCHANGE STOP LIMIT, TRAILING STOP, EXCHANGE TRAILING STOP, FOK, EXCHANGE FOK, IOC, EXCHANGE IOC.
 * @property {string} symbol (tBTCUSD, tETHUSD, ...)
 * @property {number|string} amount Positive for buy, Negative for sell
 * @property [number|string] price Price (Not required for market orders)
 * @property [number] lev Set the leverage for a derivative order, supported by derivative symbol orders only. The value should be between 1 and 100 inclusive. The field is optional, if omitted the default leverage value of 10 will be used.
 * @property [number|string] price_trailing The trailing price
 * @property [number|string] price_aux_limit Auxiliary Limit price (for STOP LIMIT)
 * @property [number|string] price_oco_stop OCO stop price
 * @property {number} flags See https://docs.bitfinex.com/v2/docs/flag-values.
 * @property [string] tif Time-In-Force: datetime for automatic order cancellation (ie. 2020-01-01 10:45:23) )
 * @property {Object} meta The meta object allows you to pass along an affiliate code inside the object - example: meta: {aff_code: "AFF_CODE_HERE"}
 */

/**
 * @param {BitfinexSessionMock} session
 * @returns {(function({chanId: number, fields: [null, NewOrderDetails]}))}
 */
module.exports = (session) => {
  return ({ fields: [placeholder, details] }) => {
    const info = new Order({
      cid: details.cid,
      symbol: details.symbol
    })

    session.notify(NEW_ORDER_REQUEST, 'SUCCESS', info.serialize())
  }
}
