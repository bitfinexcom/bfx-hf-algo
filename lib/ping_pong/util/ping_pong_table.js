'use strict'

const { preparePrice } = require('bfx-api-node-util')

const append = (pingPongTable, pingPrice, pongPrice) => {
  return [
    ...pingPongTable,
    [preparePrice(pingPrice), preparePrice(pongPrice)]
  ]
}

const extract = (pingPongTable, price) => {
  const pingItem = pingPongTable.find(item => item[0] === price)
  const pongPrice = pingItem[1]
  const nextPingPongTable = pingPongTable.filter(item => item !== pingItem)

  return [pongPrice, nextPingPongTable]
}

const getPings = (pingPongTable) => {
  return pingPongTable.map(item => item[0])
}

const getPongs = (pingPongTable) => {
  return pingPongTable.map(item => item[1])
}

module.exports = {
  append,
  extract,
  getPings,
  getPongs
}
